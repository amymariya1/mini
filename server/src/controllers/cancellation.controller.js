import Cancellation from "../models/Cancellation.js";
import Appointment from "../models/Appointment.js";
import User from "../models/User.js";
import TherapistSchedule from "../models/TherapistSchedule.js";
import { sendCancellationEmail, sendReschedulingEmail } from "../utils/mailer.js";

// Helper function to find next available time slot
async function findNextAvailableSlot(therapistId, startDate, userId) {
  try {
    // Look for available slots in the next 30 days
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 30);
    
    // Get therapist's schedule
    const schedule = await TherapistSchedule.findOne({ therapistId });
    
    if (!schedule) {
      console.error("No schedule found for therapist:", therapistId);
      return null;
    }
    
    // Check each day for availability
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const dayName = dayNames[dayOfWeek];
      
      // Check if therapist is available on this day
      if (schedule && schedule.weeklySchedule[dayName] && schedule.weeklySchedule[dayName].isAvailable) {
        const availableSlots = schedule.weeklySchedule[dayName].timeSlots || [];
        
        // Check each available time slot
        for (const timeSlot of availableSlots) {
          // Create date range for the current day
          const startOfDay = new Date(currentDate);
          startOfDay.setHours(0, 0, 0, 0);
          
          const endOfDay = new Date(currentDate);
          endOfDay.setHours(23, 59, 59, 999);
          
          // Check if this slot is already booked
          const existingAppointment = await Appointment.findOne({
            therapistId,
            date: {
              $gte: startOfDay,
              $lt: endOfDay
            },
            timeSlot,
            status: 'scheduled'
            // Removed the userId filter as it was causing issues
          });
          
          // If slot is available, return it
          if (!existingAppointment) {
            return {
              date: new Date(currentDate),
              timeSlot: timeSlot
            };
          }
        }
      }
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // No available slot found
    return null;
  } catch (error) {
    console.error("Error finding next available slot:", error);
    return null;
  }
}

// Create a new cancellation record
export async function createCancellation(req, res) {
  try {
    const { appointmentId, reason, shouldReschedule = false } = req.body;
    const therapistId = req.user._id;

    // Validate input
    if (!appointmentId) {
      return res.status(400).json({ 
        success: false, 
        message: "Appointment ID is required" 
      });
    }

    // Find the appointment
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ 
        success: false, 
        message: "Appointment not found" 
      });
    }

    // Verify that the therapist owns this appointment
    if (appointment.therapistId.toString() !== therapistId.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: "You don't have permission to cancel this appointment" 
      });
    }

    // Check if appointment is already cancelled
    if (appointment.status === 'cancelled') {
      return res.status(400).json({ 
        success: false, 
        message: "Appointment is already cancelled" 
      });
    }

    let rescheduledAppointment = null;
    let actuallyRescheduled = shouldReschedule; // Keep track of whether we actually rescheduled
    
    // If rescheduling is requested, find next available slot
    if (shouldReschedule) {
      const nextSlot = await findNextAvailableSlot(therapistId, appointment.date, appointment.userId);
      
      if (nextSlot) {
        // Create a new appointment with the next available slot
        rescheduledAppointment = new Appointment({
          therapistId: appointment.therapistId,
          userId: appointment.userId,
          date: nextSlot.date,
          timeSlot: nextSlot.timeSlot,
          availabilityType: appointment.availabilityType,
          status: 'scheduled',
          age: appointment.age,
          problem: appointment.problem,
          amount: appointment.amount,
          paymentId: appointment.paymentId
        });
        
        await rescheduledAppointment.save();
        
        // Update original appointment status to rescheduled
        appointment.status = 'rescheduled';
        appointment.updatedAt = Date.now();
        await appointment.save();
      } else {
        // If no slot found, proceed with normal cancellation
        actuallyRescheduled = false;
        appointment.status = 'cancelled';
        appointment.updatedAt = Date.now();
        await appointment.save();
      }
    } else {
      // Normal cancellation
      appointment.status = 'cancelled';
      appointment.updatedAt = Date.now();
      await appointment.save();
    }

    // Create cancellation record
    const cancellation = new Cancellation({
      appointmentId: appointment._id,
      therapistId: appointment.therapistId,
      userId: appointment.userId,
      date: appointment.date,
      timeSlot: appointment.timeSlot,
      availabilityType: appointment.availabilityType,
      reason: reason || "Cancelled by therapist",
      cancelledBy: 'therapist'
    });

    await cancellation.save();

    // Get user and therapist details for email
    const user = await User.findById(appointment.userId);
    const therapist = await User.findById(therapistId);

    // Send appropriate email to user
    if (user && therapist) {
      try {
        const formattedOriginalDate = new Date(appointment.date).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });

        if (rescheduledAppointment && actuallyRescheduled) {
          // Send rescheduling email
          const formattedNewDate = new Date(rescheduledAppointment.date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });

          await sendReschedulingEmail(user.email, {
            patientName: user.name,
            therapistName: therapist.name,
            originalDate: formattedOriginalDate,
            originalTime: appointment.timeSlot,
            newDate: formattedNewDate,
            newTime: rescheduledAppointment.timeSlot,
            reason: reason || "Cancelled by therapist"
          });

          // Update cancellation record to indicate email was sent
          cancellation.emailSent = true;
          cancellation.emailSentDate = Date.now();
          await cancellation.save();
        } else {
          // Send cancellation email
          await sendCancellationEmail(user.email, {
            patientName: user.name,
            therapistName: therapist.name,
            appointmentDate: formattedOriginalDate,
            appointmentTime: appointment.timeSlot,
            reason: reason || "Cancelled by therapist",
            amount: appointment.amount,
            refundId: `REF-${Date.now()}-${appointment._id.toString().slice(-6)}`
          });

          // Update cancellation record to indicate email was sent
          cancellation.emailSent = true;
          cancellation.emailSentDate = Date.now();
          await cancellation.save();
        }
      } catch (emailError) {
        console.error("Error sending email:", emailError);
        // Don't fail the entire operation if email fails
      }
    }

    const message = rescheduledAppointment && actuallyRescheduled 
      ? "Appointment cancelled and rescheduled successfully. Email sent to patient with new appointment details."
      : "Appointment cancelled successfully and email sent to patient.";

    res.status(201).json({ 
      success: true, 
      message: message,
      data: {
        cancellation,
        rescheduledAppointment: rescheduledAppointment || null
      }
    });
  } catch (error) {
    console.error("Error creating cancellation:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to cancel appointment: " + error.message 
    });
  }
}

// Get cancellations for a therapist
export async function getTherapistCancellations(req, res) {
  try {
    // Use authenticated user's ID
    const therapistId = req.user._id;
    
    const cancellations = await Cancellation.find({ therapistId })
      .populate('userId', 'name email')
      .populate('appointmentId', 'status')
      .sort({ cancellationDate: -1 });

    res.status(200).json({ 
      success: true, 
      data: cancellations
    });
  } catch (error) {
    console.error("Error getting therapist cancellations:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to get cancellations" 
    });
  }
}

// Get cancellations for a user
export async function getUserCancellations(req, res) {
  try {
    // Use authenticated user's ID
    const userId = req.user._id;
    
    const cancellations = await Cancellation.find({ userId })
      .populate('therapistId', 'name email')
      .populate('appointmentId', 'status')
      .sort({ cancellationDate: -1 });

    res.status(200).json({ 
      success: true, 
      data: cancellations
    });
  } catch (error) {
    console.error("Error getting user cancellations:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to get cancellations" 
    });
  }
}

// Cancel multiple appointments by date and availability type
export async function cancelAppointmentsByCriteria(req, res) {
  try {
    const { date, availabilityType, reason, timeSlots, shouldReschedule = false } = req.body;
    const therapistId = req.user._id;

    // Validate input
    if (!date) {
      return res.status(400).json({ 
        success: false, 
        message: "Date is required" 
      });
    }

    // Find appointments matching criteria
    const query = {
      therapistId,
      date: new Date(date),
      status: 'scheduled'
    };

    // Add availability type filter if provided
    if (availabilityType) {
      query.availabilityType = availabilityType;
    }

    // Add time slots filter if provided
    if (timeSlots && Array.isArray(timeSlots) && timeSlots.length > 0) {
      query.timeSlot = { $in: timeSlots };
    }

    const appointments = await Appointment.find(query);

    if (appointments.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "No appointments found matching the criteria" 
      });
    }

    // Cancel all matching appointments
    const cancellationRecords = [];
    const rescheduledAppointments = [];
    const emailPromises = [];

    for (const appointment of appointments) {
      let rescheduledAppointment = null;
      let actuallyRescheduled = shouldReschedule; // Keep track of whether we actually rescheduled
      
      // If rescheduling is requested, find next available slot
      if (shouldReschedule) {
        const nextSlot = await findNextAvailableSlot(therapistId, appointment.date, appointment.userId);
        
        if (nextSlot) {
          // Create a new appointment with the next available slot
          rescheduledAppointment = new Appointment({
            therapistId: appointment.therapistId,
            userId: appointment.userId,
            date: nextSlot.date,
            timeSlot: nextSlot.timeSlot,
            availabilityType: appointment.availabilityType,
            status: 'scheduled',
            age: appointment.age,
            problem: appointment.problem,
            amount: appointment.amount,
            paymentId: appointment.paymentId
          });
          
          await rescheduledAppointment.save();
          rescheduledAppointments.push(rescheduledAppointment);
          
          // Update original appointment status to rescheduled
          appointment.status = 'rescheduled';
          appointment.updatedAt = Date.now();
          await appointment.save();
        } else {
          // If no slot found, proceed with normal cancellation
          actuallyRescheduled = false;
          appointment.status = 'cancelled';
          appointment.updatedAt = Date.now();
          await appointment.save();
        }
      } else {
        // Normal cancellation
        appointment.status = 'cancelled';
        appointment.updatedAt = Date.now();
        await appointment.save();
      }

      // Create cancellation record
      const cancellation = new Cancellation({
        appointmentId: appointment._id,
        therapistId: appointment.therapistId,
        userId: appointment.userId,
        date: appointment.date,
        timeSlot: appointment.timeSlot,
        availabilityType: appointment.availabilityType,
        reason: reason || "Cancelled by therapist",
        cancelledBy: 'therapist'
      });

      await cancellation.save();
      cancellationRecords.push(cancellation);

      // Get user and therapist details for email
      const userPromise = User.findById(appointment.userId);
      const therapistPromise = User.findById(therapistId);
      
      emailPromises.push(
        Promise.all([userPromise, therapistPromise]).then(async ([user, therapist]) => {
          if (user && therapist) {
            try {
              const formattedOriginalDate = new Date(appointment.date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              });

              if (rescheduledAppointment && actuallyRescheduled) {
                // Send rescheduling email
                const formattedNewDate = new Date(rescheduledAppointment.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                });

                await sendReschedulingEmail(user.email, {
                  patientName: user.name,
                  therapistName: therapist.name,
                  originalDate: formattedOriginalDate,
                  originalTime: appointment.timeSlot,
                  newDate: formattedNewDate,
                  newTime: rescheduledAppointment.timeSlot,
                  reason: reason || "Cancelled by therapist"
                });

                // Update cancellation record to indicate email was sent
                cancellation.emailSent = true;
                cancellation.emailSentDate = Date.now();
                await cancellation.save();
              } else {
                // Send cancellation email
                await sendCancellationEmail(user.email, {
                  patientName: user.name,
                  therapistName: therapist.name,
                  appointmentDate: formattedOriginalDate,
                  appointmentTime: appointment.timeSlot,
                  reason: reason || "Cancelled by therapist",
                  amount: appointment.amount,
                  refundId: `REF-${Date.now()}-${appointment._id.toString().slice(-6)}`
                });

                // Update cancellation record to indicate email was sent
                cancellation.emailSent = true;
                cancellation.emailSentDate = Date.now();
                await cancellation.save();
              }
            } catch (emailError) {
              console.error("Error sending email:", emailError);
              // Don't fail the entire operation if email fails
            }
          }
        }).catch(error => {
          console.error("Error processing email for appointment:", appointment._id, error);
          // Continue with other emails even if one fails
        })
      );
    }

    // Send all emails concurrently
    await Promise.all(emailPromises);

    const message = shouldReschedule 
      ? (rescheduledAppointments.length > 0 
          ? `${rescheduledAppointments.length} appointment(s) rescheduled and ${appointments.length - rescheduledAppointments.length} cancelled. Emails sent to patients with details.`
          : `All ${appointments.length} appointment(s) cancelled as no available slots found for rescheduling.`)
      : `${appointments.length} appointment(s) cancelled successfully and emails sent to patients.`;

    res.status(200).json({ 
      success: true, 
      message: message,
      data: {
        cancellations: cancellationRecords,
        rescheduledAppointments: rescheduledAppointments
      }
    });
  } catch (error) {
    console.error("Error cancelling appointments by criteria:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to cancel appointments: " + error.message 
    });
  }
}
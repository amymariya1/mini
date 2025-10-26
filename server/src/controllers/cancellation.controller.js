import Cancellation from "../models/Cancellation.js";
import Appointment from "../models/Appointment.js";
import User from "../models/User.js";
import { sendCancellationEmail } from "../utils/mailer.js";

// Create a new cancellation record
export async function createCancellation(req, res) {
  try {
    const { appointmentId, reason } = req.body;
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

    // Update appointment status to cancelled
    appointment.status = 'cancelled';
    appointment.updatedAt = Date.now();
    await appointment.save();

    // Get user and therapist details for email
    const user = await User.findById(appointment.userId);
    const therapist = await User.findById(appointment.therapistId);

    // Send cancellation email to user
    if (user && therapist) {
      try {
        const formattedDate = new Date(appointment.date).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });

        await sendCancellationEmail(user.email, {
          patientName: user.name,
          therapistName: therapist.name,
          appointmentDate: formattedDate,
          appointmentTime: appointment.timeSlot,
          reason: reason || "Cancelled by therapist"
        });

        // Update cancellation record to indicate email was sent
        cancellation.emailSent = true;
        cancellation.emailSentDate = Date.now();
        await cancellation.save();
      } catch (emailError) {
        console.error("Error sending cancellation email:", emailError);
      }
    }

    res.status(201).json({ 
      success: true, 
      message: "Appointment cancelled successfully and email sent to patient",
      data: cancellation
    });
  } catch (error) {
    console.error("Error creating cancellation:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to cancel appointment" 
    });
  }
}

// Get cancellations for a therapist
export async function getTherapistCancellations(req, res) {
  try {
    const { therapistId } = req.query;
    
    // Validate input
    if (!therapistId) {
      return res.status(400).json({ 
        success: false, 
        message: "Therapist ID is required" 
      });
    }

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
    const { userId } = req.query;
    
    // Validate input
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: "User ID is required" 
      });
    }

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
    const { date, availabilityType, reason } = req.body;
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

    const appointments = await Appointment.find(query);

    if (appointments.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "No appointments found matching the criteria" 
      });
    }

    // Cancel all matching appointments
    const cancellationRecords = [];
    const emailPromises = [];

    for (const appointment of appointments) {
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

      // Update appointment status to cancelled
      appointment.status = 'cancelled';
      appointment.updatedAt = Date.now();
      await appointment.save();

      // Get user and therapist details for email
      const userPromise = User.findById(appointment.userId);
      const therapistPromise = User.findById(appointment.therapistId);
      
      emailPromises.push(
        Promise.all([userPromise, therapistPromise]).then(async ([user, therapist]) => {
          if (user && therapist) {
            try {
              const formattedDate = new Date(appointment.date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              });

              await sendCancellationEmail(user.email, {
                patientName: user.name,
                therapistName: therapist.name,
                appointmentDate: formattedDate,
                appointmentTime: appointment.timeSlot,
                reason: reason || "Cancelled by therapist"
              });

              // Update cancellation record to indicate email was sent
              cancellation.emailSent = true;
              cancellation.emailSentDate = Date.now();
              await cancellation.save();
            } catch (emailError) {
              console.error("Error sending cancellation email:", emailError);
            }
          }
        })
      );
    }

    // Send all emails concurrently
    await Promise.all(emailPromises);

    res.status(200).json({ 
      success: true, 
      message: `${appointments.length} appointment(s) cancelled successfully and emails sent to patients`,
      data: cancellationRecords
    });
  } catch (error) {
    console.error("Error cancelling appointments by criteria:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to cancel appointments" 
    });
  }
}
import Leave from "../models/Leave.js";
import Appointment from "../models/Appointment.js";
import User from "../models/User.js";
import { sendLeaveNotificationEmail } from "../utils/mailer.js";

// Create a new leave for a therapist
export async function createLeave(req, res) {
  try {
    const { therapistId, startDate, endDate, reason } = req.body;
    
    // Validate input
    if (!therapistId || !startDate || !endDate) {
      return res.status(400).json({ 
        success: false, 
        message: "Therapist ID, start date, and end date are required" 
      });
    }
    
    // Check if start date is before end date
    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({ 
        success: false, 
        message: "Start date must be before end date" 
      });
    }
    
    // Check if there are existing appointments in that period
    const affectedAppointments = await Appointment.find({
      therapistId,
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      },
      status: { $in: ['scheduled'] }
    });
    
    // Notify all affected users
    const affectedUserIds = [...new Set(affectedAppointments.map(appt => appt.userId.toString()))];
    const affectedUsers = await User.find({
      _id: { $in: affectedUserIds }
    });
    
    // Send notifications to affected users
    for (const user of affectedUsers) {
      try {
        await sendLeaveNotificationEmail(user.email, {
          therapistName: user.name,
          startDate,
          endDate,
          reason,
          affectedAppointments: affectedAppointments
            .filter(appt => appt.userId.toString() === user._id.toString())
            .map(appt => ({
              date: appt.date,
              timeSlot: appt.timeSlot
            }))
        });
      } catch (emailError) {
        console.error("Error sending leave notification email:", emailError);
      }
    }
    
    // Cancel or reschedule appointments automatically
    // For now, we'll cancel them
    for (const appointment of affectedAppointments) {
      appointment.status = 'cancelled';
      appointment.leaveId = null; // Will be set after creating the leave
      appointment.updatedAt = Date.now();
      await appointment.save();
    }
    
    // Create the leave record
    const leave = new Leave({
      therapistId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reason
    });
    await leave.save();
    
    // Update appointments with the leave ID
    for (const appointment of affectedAppointments) {
      appointment.leaveId = leave._id;
      await appointment.save();
    }
    
    res.status(201).json({ 
      success: true, 
      message: "Leave created successfully",
      data: leave,
      affectedAppointments: affectedAppointments.map(appt => ({
        id: appt._id,
        date: appt.date,
        timeSlot: appt.timeSlot,
        status: appt.status
      }))
    });
  } catch (error) {
    console.error("Error creating leave:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to create leave" 
    });
  }
}

// Get leaves for a therapist
export async function getLeaves(req, res) {
  try {
    const { therapistId } = req.query;
    
    // Validate input
    if (!therapistId) {
      return res.status(400).json({ 
        success: false, 
        message: "Therapist ID is required" 
      });
    }
    
    const leaves = await Leave.find({ therapistId });
    
    res.status(200).json({ 
      success: true, 
      data: leaves
    });
  } catch (error) {
    console.error("Error getting leaves:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to get leaves" 
    });
  }
}

// Get leave by ID
export async function getLeaveById(req, res) {
  try {
    const { id } = req.params;
    
    const leave = await Leave.findById(id);
    
    if (!leave) {
      return res.status(404).json({ 
        success: false, 
        message: "Leave not found" 
      });
    }
    
    res.status(200).json({ 
      success: true, 
      data: leave
    });
  } catch (error) {
    console.error("Error getting leave:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to get leave" 
    });
  }
}

// Update leave
export async function updateLeave(req, res) {
  try {
    const { id } = req.params;
    const { startDate, endDate, reason, status } = req.body;
    
    const leave = await Leave.findById(id);
    
    if (!leave) {
      return res.status(404).json({ 
        success: false, 
        message: "Leave not found" 
      });
    }
    
    // Update fields if provided
    if (startDate) leave.startDate = new Date(startDate);
    if (endDate) leave.endDate = new Date(endDate);
    if (reason !== undefined) leave.reason = reason;
    if (status) leave.status = status;
    leave.updatedAt = Date.now();
    
    await leave.save();
    
    res.status(200).json({ 
      success: true, 
      message: "Leave updated successfully",
      data: leave
    });
  } catch (error) {
    console.error("Error updating leave:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to update leave" 
    });
  }
}

// Delete leave
export async function deleteLeave(req, res) {
  try {
    const { id } = req.params;
    
    const leave = await Leave.findById(id);
    
    if (!leave) {
      return res.status(404).json({ 
        success: false, 
        message: "Leave not found" 
      });
    }
    
    await Leave.findByIdAndDelete(id);
    
    res.status(200).json({ 
      success: true, 
      message: "Leave deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting leave:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to delete leave" 
    });
  }
}

// Get leaves that overlap with a given date range
export async function getOverlappingLeaves(therapistId, startDate, endDate) {
  return await Leave.find({
    therapistId,
    $or: [
      { startDate: { $lte: endDate }, endDate: { $gte: startDate } },
      { startDate: { $gte: startDate, $lte: endDate } },
      { endDate: { $gte: startDate, $lte: endDate } }
    ]
  });
}
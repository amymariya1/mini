import UpcomingPatient from "../models/UpcomingPatient.js";
import User from "../models/User.js";

// Create a new upcoming patient
export async function createUpcomingPatient(req, res) {
  try {
    const { name, email, phone, age, observation, appointmentDate } = req.body;
    const therapistId = req.user._id;

    // Validate required fields
    if (!name || !email || !appointmentDate) {
      return res.status(400).json({ 
        success: false, 
        message: "Name, email, and appointment date are required" 
      });
    }

    // Validate that the therapist exists and is actually a therapist
    const therapist = await User.findById(therapistId);
    if (!therapist || therapist.userType !== 'therapist') {
      return res.status(403).json({ 
        success: false, 
        message: "Only therapists can create upcoming patient records" 
      });
    }

    // Check if an upcoming patient with the same email and appointment date already exists
    const existingPatient = await UpcomingPatient.findOne({ 
      email, 
      appointmentDate,
      therapist: therapistId
    });
    
    if (existingPatient) {
      return res.status(400).json({ 
        success: false, 
        message: "An upcoming patient with this email and appointment date already exists" 
      });
    }

    // Create new upcoming patient record
    const upcomingPatient = new UpcomingPatient({
      name,
      email,
      phone,
      age,
      observation,
      appointmentDate,
      therapist: therapistId
    });

    await upcomingPatient.save();

    // Populate the response with therapist details
    const populatedPatient = await UpcomingPatient.findById(upcomingPatient._id)
      .populate('therapist', 'name email');

    res.status(201).json({ 
      success: true, 
      message: "Upcoming patient created successfully",
      data: populatedPatient
    });
  } catch (error) {
    console.error("Error creating upcoming patient:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to create upcoming patient" 
    });
  }
}

// Get all upcoming patients for a therapist
export async function getUpcomingPatients(req, res) {
  try {
    const therapistId = req.user._id;
    const { status, startDate, endDate } = req.query;

    // Build query
    const query = { therapist: therapistId };
    
    // Filter by status if provided
    if (status) {
      query.status = status;
    }
    
    // Filter by date range if provided
    if (startDate || endDate) {
      query.appointmentDate = {};
      if (startDate) {
        query.appointmentDate.$gte = new Date(startDate);
      }
      if (endDate) {
        query.appointmentDate.$lte = new Date(endDate);
      }
    }

    const upcomingPatients = await UpcomingPatient.find(query)
      .populate('therapist', 'name email')
      .sort({ appointmentDate: 1 });

    res.status(200).json({ 
      success: true, 
      data: upcomingPatients
    });
  } catch (error) {
    console.error("Error getting upcoming patients:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to get upcoming patients" 
    });
  }
}

// Get a specific upcoming patient
export async function getUpcomingPatient(req, res) {
  try {
    const { id } = req.params;
    const therapistId = req.user._id;

    const upcomingPatient = await UpcomingPatient.findOne({ 
      _id: id, 
      therapist: therapistId 
    }).populate('therapist', 'name email');

    if (!upcomingPatient) {
      return res.status(404).json({ 
        success: false, 
        message: "Upcoming patient not found" 
      });
    }

    res.status(200).json({ 
      success: true, 
      data: upcomingPatient
    });
  } catch (error) {
    console.error("Error getting upcoming patient:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to get upcoming patient" 
    });
  }
}

// Update an upcoming patient
export async function updateUpcomingPatient(req, res) {
  try {
    const { id } = req.params;
    const { name, email, phone, age, observation, appointmentDate, status } = req.body;
    const therapistId = req.user._id;

    // Build update object with only provided fields
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (age !== undefined) updateData.age = age;
    if (observation !== undefined) updateData.observation = observation;
    if (appointmentDate) updateData.appointmentDate = appointmentDate;
    if (status) updateData.status = status;
    updateData.updatedAt = Date.now();

    const upcomingPatient = await UpcomingPatient.findOneAndUpdate(
      { _id: id, therapist: therapistId },
      updateData,
      { new: true, runValidators: true }
    ).populate('therapist', 'name email');

    if (!upcomingPatient) {
      return res.status(404).json({ 
        success: false, 
        message: "Upcoming patient not found" 
      });
    }

    res.status(200).json({ 
      success: true, 
      message: "Upcoming patient updated successfully",
      data: upcomingPatient
    });
  } catch (error) {
    console.error("Error updating upcoming patient:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to update upcoming patient" 
    });
  }
}

// Delete an upcoming patient
export async function deleteUpcomingPatient(req, res) {
  try {
    const { id } = req.params;
    const therapistId = req.user._id;

    const upcomingPatient = await UpcomingPatient.findOneAndDelete({ 
      _id: id, 
      therapist: therapistId 
    });

    if (!upcomingPatient) {
      return res.status(404).json({ 
        success: false, 
        message: "Upcoming patient not found" 
      });
    }

    res.status(200).json({ 
      success: true, 
      message: "Upcoming patient deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting upcoming patient:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to delete upcoming patient" 
    });
  }
}
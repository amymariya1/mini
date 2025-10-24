import TentativeAvailability from "../models/TentativeAvailability.js";

// Set tentative availability for a specific date
export async function setTentativeAvailability(req, res) {
  try {
    const { therapistId, date, availability, reason } = req.body;
    
    // Validate input
    if (!therapistId || !date || !availability) {
      return res.status(400).json({ 
        success: false, 
        message: "Therapist ID, date, and availability are required" 
      });
    }
    
    // Validate availability value
    const validAvailabilities = ['full_day', 'morning', 'evening', 'none', 'tentative'];
    if (!validAvailabilities.includes(availability)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid availability value" 
      });
    }
    
    // Check if a tentative availability already exists for this date and therapist
    let tentativeAvailability = await TentativeAvailability.findOne({ therapistId, date: new Date(date) });
    
    if (tentativeAvailability) {
      // Update existing tentative availability
      tentativeAvailability.availability = availability;
      tentativeAvailability.reason = reason;
      tentativeAvailability.updatedAt = Date.now();
      await tentativeAvailability.save();
    } else {
      // Create new tentative availability
      tentativeAvailability = new TentativeAvailability({
        therapistId,
        date: new Date(date),
        availability,
        reason
      });
      await tentativeAvailability.save();
    }
    
    res.status(200).json({ 
      success: true, 
      message: "Tentative availability set successfully",
      data: tentativeAvailability
    });
  } catch (error) {
    console.error("Error setting tentative availability:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to set tentative availability" 
    });
  }
}

// Get tentative availability for a specific date
export async function getTentativeAvailability(req, res) {
  try {
    const { therapistId, date } = req.query;
    
    // Validate input
    if (!therapistId || !date) {
      return res.status(400).json({ 
        success: false, 
        message: "Therapist ID and date are required" 
      });
    }
    
    const tentativeAvailability = await TentativeAvailability.findOne({ 
      therapistId, 
      date: new Date(date) 
    });
    
    res.status(200).json({ 
      success: true, 
      data: tentativeAvailability || { availability: 'none' }
    });
  } catch (error) {
    console.error("Error getting tentative availability:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to get tentative availability" 
    });
  }
}

// Get tentative availability for a date range
export async function getTentativeAvailabilityRange(req, res) {
  try {
    const { therapistId, startDate, endDate } = req.query;
    
    // Validate input
    if (!therapistId || !startDate || !endDate) {
      return res.status(400).json({ 
        success: false, 
        message: "Therapist ID, start date, and end date are required" 
      });
    }
    
    const tentativeAvailabilities = await TentativeAvailability.find({ 
      therapistId,
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    });
    
    res.status(200).json({ 
      success: true, 
      data: tentativeAvailabilities
    });
  } catch (error) {
    console.error("Error getting tentative availability range:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to get tentative availability range" 
    });
  }
}

// Remove tentative availability
export async function removeTentativeAvailability(req, res) {
  try {
    const { therapistId, date } = req.body;
    
    // Validate input
    if (!therapistId || !date) {
      return res.status(400).json({ 
        success: false, 
        message: "Therapist ID and date are required" 
      });
    }
    
    await TentativeAvailability.deleteOne({ 
      therapistId, 
      date: new Date(date) 
    });
    
    res.status(200).json({ 
      success: true, 
      message: "Tentative availability removed successfully"
    });
  } catch (error) {
    console.error("Error removing tentative availability:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to remove tentative availability" 
    });
  }
}
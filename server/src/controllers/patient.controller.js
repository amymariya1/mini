import Patient from "../models/Patient.js";
import User from "../models/User.js";

// Create a new patient and consultation record
export async function createPatient(req, res) {
  try {
    const { 
      patientName, 
      patientEmail, 
      patientPhone, 
      patientAge,
      consultationNotes,
      medicalHistory,
      emergencyContactName,
      emergencyContactPhone,
      emergencyContactRelationship
    } = req.body;
    
    const therapistId = req.user._id;

    // Validate required fields
    if (!patientName || !patientEmail || !consultationNotes) {
      return res.status(400).json({ 
        success: false, 
        message: "Patient name, email, and consultation notes are required" 
      });
    }

    // Check if patient already exists
    let user = await User.findOne({ email: patientEmail });
    
    if (!user) {
      // Create new user if doesn't exist
      user = new User({
        name: patientName,
        email: patientEmail,
        age: patientAge,
        userType: 'user',
        passwordHash: 'temp-password', // This should be properly handled in a real implementation
        isApproved: true,
        isActive: true
      });
      await user.save();
    }

    // Check if patient record already exists for this therapist
    let patient = await Patient.findOne({ user: user._id, therapist: therapistId });
    
    if (patient) {
      return res.status(400).json({ 
        success: false, 
        message: "Patient already exists in your records" 
      });
    }

    // Create new patient record
    patient = new Patient({
      user: user._id,
      therapist: therapistId,
      medicalHistory: medicalHistory || '',
      notes: [{
        content: consultationNotes,
        createdBy: therapistId
      }],
      emergencyContact: {
        name: emergencyContactName || '',
        phone: emergencyContactPhone || '',
        relationship: emergencyContactRelationship || ''
      }
    });

    await patient.save();

    // Populate the response with user details
    patient = await patient.populate('user', 'name email');
    patient = await patient.populate('therapist', 'name email');

    res.status(201).json({ 
      success: true, 
      message: "Patient created successfully",
      data: patient
    });
  } catch (error) {
    console.error("Error creating patient:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to create patient" 
    });
  }
}

// Get all patients for a therapist
export async function getPatients(req, res) {
  try {
    const therapistId = req.user._id;

    const patients = await Patient.find({ therapist: therapistId })
      .populate('user', 'name email')
      .populate('therapist', 'name email');

    res.status(200).json({ 
      success: true, 
      data: patients
    });
  } catch (error) {
    console.error("Error getting patients:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to get patients" 
    });
  }
}

// Get a specific patient
export async function getPatient(req, res) {
  try {
    const { id } = req.params;
    const therapistId = req.user._id;

    const patient = await Patient.findOne({ _id: id, therapist: therapistId })
      .populate('user', 'name email')
      .populate('therapist', 'name email');

    if (!patient) {
      return res.status(404).json({ 
        success: false, 
        message: "Patient not found" 
      });
    }

    res.status(200).json({ 
      success: true, 
      data: patient
    });
  } catch (error) {
    console.error("Error getting patient:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to get patient" 
    });
  }
}

// Add a consultation note to a patient record
export async function addConsultationNote(req, res) {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const therapistId = req.user._id;

    // Validate required fields
    if (!content) {
      return res.status(400).json({ 
        success: false, 
        message: "Consultation note content is required" 
      });
    }

    const patient = await Patient.findOne({ _id: id, therapist: therapistId });

    if (!patient) {
      return res.status(404).json({ 
        success: false, 
        message: "Patient not found" 
      });
    }

    // Add new note
    patient.notes.push({
      content,
      createdBy: therapistId
    });

    await patient.save();

    res.status(200).json({ 
      success: true, 
      message: "Consultation note added successfully",
      data: patient
    });
  } catch (error) {
    console.error("Error adding consultation note:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to add consultation note" 
    });
  }
}

// Update patient information
export async function updatePatient(req, res) {
  try {
    const { id } = req.params;
    const { 
      medicalHistory,
      emergencyContactName,
      emergencyContactPhone,
      emergencyContactRelationship
    } = req.body;
    
    const therapistId = req.user._id;

    const patient = await Patient.findOne({ _id: id, therapist: therapistId });

    if (!patient) {
      return res.status(404).json({ 
        success: false, 
        message: "Patient not found" 
      });
    }

    // Update patient information
    if (medicalHistory !== undefined) {
      patient.medicalHistory = medicalHistory;
    }

    if (emergencyContactName !== undefined || 
        emergencyContactPhone !== undefined || 
        emergencyContactRelationship !== undefined) {
      patient.emergencyContact = {
        name: emergencyContactName || patient.emergencyContact.name || '',
        phone: emergencyContactPhone || patient.emergencyContact.phone || '',
        relationship: emergencyContactRelationship || patient.emergencyContact.relationship || ''
      };
    }

    await patient.save();

    res.status(200).json({ 
      success: true, 
      message: "Patient updated successfully",
      data: patient
    });
  } catch (error) {
    console.error("Error updating patient:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to update patient" 
    });
  }
}

// Handle patient referral and send email
export async function referPatient(req, res) {
  try {
    const { 
      patientName, 
      patientEmail, 
      patientPhone, 
      referringProfessional, 
      professionalEmail, 
      reason, 
      additionalInfo 
    } = req.body;

    // Validate required fields
    if (!patientName || !patientEmail || !referringProfessional || !professionalEmail || !reason) {
      return res.status(400).json({ 
        success: false, 
        message: "Patient name, email, referring professional, professional email, and reason are required" 
      });
    }

    // Import the email function here to avoid circular dependencies
    const { sendPatientReferralEmail } = await import('../utils/mailer.js');

    // Prepare referral details for the email
    const referralDetails = {
      patientName,
      patientEmail,
      patientPhone: patientPhone || 'Not provided',
      referringProfessional,
      professionalEmail,
      reason: getReasonLabel(reason),
      additionalInfo: additionalInfo || 'None provided'
    };

    // Send referral email to the patient
    await sendPatientReferralEmail(patientEmail, referralDetails);

    res.status(200).json({ 
      success: true, 
      message: "Patient referral submitted successfully. An email has been sent to the patient." 
    });
  } catch (error) {
    console.error("Error processing patient referral:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to process patient referral. Please try again." 
    });
  }
}

// Helper function to get readable labels for referral reasons
function getReasonLabel(reasonCode) {
  const reasonMap = {
    'anxiety': 'Anxiety Disorders',
    'depression': 'Depression',
    'ptsd': 'PTSD/Trauma',
    'bipolar': 'Bipolar Disorder',
    'ocd': 'OCD',
    'stress': 'Stress Management',
    'grief': 'Grief and Loss',
    'relationship': 'Relationship Issues',
    'other': 'Other'
  };
  
  return reasonMap[reasonCode] || reasonCode;
}

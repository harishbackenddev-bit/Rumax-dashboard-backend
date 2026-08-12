// services/website/investigatorGuideService.ts
import { Response } from "express";
import { errorResponseHandler } from "../../lib/errors/error-response-handler";
import { httpStatusCode } from "../../lib/constant";
import { investigatorGuideModel } from "../../models/website/investigatorGuideSchema";
import { callbackModel } from "../../models/website/callbackSchema";
import { feasibilityModel } from "../../models/website/feasibilitySchema";
import { trialSupportModel } from "../../models/website/trialSupportSchema";
import { domiciliaryAssessmentModel } from "../../models/website/domiciliaryAssessment-schema";
import { trainingBookingModel } from "../../models/website/trainingBookingSchema";
import { feedbackModel } from "../../models/website/feedbackSchema";
import { enquiryModel } from "../../models/website/enquirySchema";
import { referralModel } from "../../models/website/referralSchema";
import { careReadinessModel } from "../../models/website/careReadinessSchema";
import { fundingPathwayModel } from "../../models/website/fundingPathwaySchema";
import { careCostModel } from "../../models/website/careCostSchema";



interface GuideFormData {
  fullName: string;
  workEmail: string;
  organisation: string;
}

interface CallbackFormData {
  fullName: string;
  phoneNumber: string;
  workEmail: string;
  organisation: string;
  bestTimeToCall?: string;
  preferredContactMethod?: string;
  message?: string;
}

interface FeasibilityFormData {
  // Step 1
  whoAreYou: string;
  fullName: string;
  workEmail: string;
  companyName: string;
  phoneNumber: string;
  areasOfInterest: string[];
  // Step 2
  studyPhase: string;
  patientEnrollment: string;
  trialDuration: number;
  diseaseIndication: string;
  studyStartDate: string;
  operationalChallenges: string[];
  additionalComments?: string;
}

interface TrialSupportFormData {
  studyPhase: string[];
  therapeuticArea: string[];
  description: string;
  fullName: string;
  email: string;
  designation: string;
  companyWebsite: string;
  phoneNumber: string;
  preferredDate: string;
  preferredTime: string;
  timezone: string;
  country: string;
}

// ✅ Save Investigator Site Guide Form
export const saveInvestigatorGuideService = async (
  payload: GuideFormData,
  req: any,
  res: Response
) => {
  try {
    const { fullName, workEmail, organisation } = payload;

    // Validate
    if (!fullName || !workEmail || !organisation) {
      return errorResponseHandler(
        "All fields are required",
        httpStatusCode.BAD_REQUEST,
        res
      );
    }

    // Check if email already exists
    const existing = await investigatorGuideModel.findOne({
      workEmail: workEmail.toLowerCase(),
    });

    if (existing) {
      return errorResponseHandler(
        "This email has already been registered for the Investigator Site Guide",
        httpStatusCode.NOT_FOUND,
        res
      );
    }

    // Get IP and User Agent
    const ipAddress = req.ip || req.socket?.remoteAddress || null;
    const userAgent = req.headers?.["user-agent"] || null;

    // Save to database
    const formData = new investigatorGuideModel({
      fullName,
      workEmail: workEmail.toLowerCase(),
      organisation,
      ipAddress,
      userAgent,
      formName: "Investigator Site Guide",
      source: "investigator-guide-form",
    });

    await formData.save();

    return {
      success: true,
      message: "Investigator Site Guide form submitted successfully!",
      data: {
        id: formData._id,
        fullName: formData.fullName,
        workEmail: formData.workEmail,
        organisation: formData.organisation,
        formName: formData.formName,
        createdAt: formData.createdAt,
      },
    };

  } catch (error: any) {
    console.error("Error saving investigator guide:", error);
    return errorResponseHandler(
      error.message || "Failed to save form",
      httpStatusCode.INTERNAL_SERVER_ERROR,
      res
    );
  }
};

// ✅ Save Callback Request
export const saveCallbackService = async (
  payload: CallbackFormData,
  req: any,
  res: Response
) => {
  try {
    const {
      fullName,
      phoneNumber,
      workEmail,
      organisation,
      bestTimeToCall,
      preferredContactMethod,
      message,
    } = payload;

    // Validate
    if (!fullName || !phoneNumber || !workEmail || !organisation) {
      return errorResponseHandler(
        "All fields are required",
        httpStatusCode.BAD_REQUEST,
        res
      );
    }

    // Get IP and User Agent
    const ipAddress = req.ip || req.socket?.remoteAddress || null;
    const userAgent = req.headers?.["user-agent"] || null;

    // Save to database
    const formData = new callbackModel({
      fullName,
      phoneNumber,
      workEmail: workEmail.toLowerCase(),
      organisation,
      bestTimeToCall: bestTimeToCall || "anytime",
      preferredContactMethod: preferredContactMethod || "phone",
      message: message || null,
      ipAddress,
      userAgent,
      formName: "Request a Callback",
      source: "callback-form",
    });

    await formData.save();

    return {
      success: true,
      message: "Callback request submitted successfully!",
      data: {
        id: formData._id,
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        workEmail: formData.workEmail,
        organisation: formData.organisation,
        bestTimeToCall: formData.bestTimeToCall,
        createdAt: formData.createdAt,
      },
    };

  } catch (error: any) {
    console.error("Error saving callback:", error);
    return errorResponseHandler(
      error.message || "Failed to save callback request",
      httpStatusCode.INTERNAL_SERVER_ERROR,
      res
    );
  }
};

export const saveFeasibilityService = async (
  payload: FeasibilityFormData,
  req: any,
  res: Response
) => {
  try {
    const {
      whoAreYou,
      fullName,
      workEmail,
      companyName,
      phoneNumber,
      areasOfInterest,
      studyPhase,
      patientEnrollment,
      trialDuration,
      diseaseIndication,
      studyStartDate,
      operationalChallenges,
      additionalComments,
    } = payload;

    // Validate
    if (!whoAreYou || !fullName || !workEmail || !companyName || !phoneNumber) {
      return errorResponseHandler(
        "All Step 1 fields are required",
        httpStatusCode.BAD_REQUEST,
        res
      );
    }

    if (!studyPhase || !patientEnrollment || !trialDuration || !diseaseIndication || !studyStartDate) {
      return errorResponseHandler(
        "All Step 2 fields are required",
        httpStatusCode.BAD_REQUEST,
        res
      );
    }

    // Get IP and User Agent
    const ipAddress = req.ip || req.socket?.remoteAddress || null;
    const userAgent = req.headers?.["user-agent"] || null;

    // Save to database
    const formData = new feasibilityModel({
      whoAreYou,
      fullName,
      workEmail: workEmail.toLowerCase(),
      companyName,
      phoneNumber,
      areasOfInterest: areasOfInterest || [],
      studyPhase,
      patientEnrollment,
      trialDuration,
      diseaseIndication,
      studyStartDate,
      operationalChallenges: operationalChallenges || [],
      additionalComments: additionalComments || null,
      ipAddress,
      userAgent,
      formName: "Trial Feasibility Assessment",
      source: "feasibility-assessment-form",
    });

    await formData.save();

    return {
      success: true,
      message: "Feasibility assessment submitted successfully!",
      data: {
        id: formData._id,
        fullName: formData.fullName,
        workEmail: formData.workEmail,
        companyName: formData.companyName,
        studyPhase: formData.studyPhase,
        trialDuration: formData.trialDuration,
        createdAt: formData.createdAt,
      },
    };

  } catch (error: any) {
    console.error("Error saving feasibility:", error);
    return errorResponseHandler(
      error.message || "Failed to save feasibility assessment",
      httpStatusCode.INTERNAL_SERVER_ERROR,
      res
    );
  }
};

// ✅ Save Trial Support Form
export const saveTrialSupportService = async (
  payload: TrialSupportFormData,
  req: any,
  res: Response
) => {
  try {
    const {
      studyPhase,
      therapeuticArea,
      description,
      fullName,
      email,
      designation,
      companyWebsite,
      phoneNumber,
      preferredDate,
      preferredTime,
      timezone,
      country,
    } = payload;

    // Validate
    if (!fullName || !email || !designation || !phoneNumber || !preferredDate || !preferredTime) {
      return errorResponseHandler(
        "All required fields must be filled",
        httpStatusCode.BAD_REQUEST,
        res
      );
    }

    if (!email.includes('@')) {
      return errorResponseHandler(
        "Invalid email format",
        httpStatusCode.BAD_REQUEST,
        res
      );
    }

    // Get IP and User Agent
    const ipAddress = req.ip || req.socket?.remoteAddress || null;
    const userAgent = req.headers?.["user-agent"] || null;

    // Save to database
    const formData = new trialSupportModel({
      studyPhase: studyPhase || [],
      therapeuticArea: therapeuticArea || [],
      description: description || null,
      fullName,
      email: email.toLowerCase(),
      designation,
      companyWebsite: companyWebsite || null,
      phoneNumber,
      preferredDate,
      preferredTime,
      timezone: timezone || null,
      country: country || null,
      ipAddress,
      userAgent,
      formName: "Trial Support Form",
      source: "trial-support-form",
    });

    await formData.save();

    return {
      success: true,
      message: "Trial support form submitted successfully!",
      data: {
        id: formData._id,
        fullName: formData.fullName,
        email: formData.email,
        studyPhase: formData.studyPhase,
        createdAt: formData.createdAt,
      },
    };

  } catch (error: any) {
    console.error("Error saving trial support:", error);
    return errorResponseHandler(
      error.message || "Failed to save trial support form",
      httpStatusCode.INTERNAL_SERVER_ERROR,
      res
    );
  }
};



export const saveDomiciliaryAssessmentService = async (
  payload: any,
  req: any,
  res: Response
) => {
  try {
    const {
      firstName,
      lastName,
      fullName,
      phoneNumber,
      email,
      postcode,
      relationship,
      careType,
      timeframe,
      fundingType,
      additionalInfo,
      consent,
      source,
      formName,
    } = payload;

    // Validate required fields
    if (
      !firstName ||
      !lastName ||
      !fullName ||
      !phoneNumber ||
      !email ||
      !postcode ||
      !relationship ||
      !careType ||
      careType.length === 0 ||
      !timeframe ||
      !consent
    ) {
      return errorResponseHandler(
        "All required fields must be filled",
        httpStatusCode.BAD_REQUEST,
        res
      );
    }

    // Validate email
    if (!email.includes('@') || !/\S+@\S+\.\S+/.test(email)) {
      return errorResponseHandler(
        "Invalid email format",
        httpStatusCode.BAD_REQUEST,
        res
      );
    }

    // Validate phone number (10-15 digits)
    const phoneRegex = /^[\d\s\-+()]{10,15}$/;
    if (!phoneRegex.test(phoneNumber.replace(/\s/g, ''))) {
      return errorResponseHandler(
        "Invalid phone number format",
        httpStatusCode.BAD_REQUEST,
        res
      );
    }

    // Get IP and User Agent
    const ipAddress = req.ip || req.socket?.remoteAddress || null;
    const userAgent = req.headers?.["user-agent"] || null;

    // Save to database
    const formData = new domiciliaryAssessmentModel({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      fullName: fullName.trim(),
      phoneNumber: phoneNumber.trim(),
      email: email.toLowerCase().trim(),
      postcode: postcode.trim().toUpperCase(),
      relationship,
      careType: careType || [],
      timeframe,
      fundingType: fundingType || "Not specified",
      additionalInfo: additionalInfo ? additionalInfo.trim() : null,
      consent,
      ipAddress,
      userAgent,
      formName: formName || "Domiciliary Care Assessment",
      source: source || "domiciliary-care-page",
    });

    await formData.save();

    return {
      success: true,
      message: "Domiciliary care assessment submitted successfully! We will contact you within one working day.",
      data: {
        id: formData._id,
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        careType: formData.careType,
        timeframe: formData.timeframe,
        createdAt: formData.createdAt,
      },
    };

  } catch (error: any) {
    console.error("Error saving domiciliary assessment:", error);
    return errorResponseHandler(
      error.message || "Failed to save domiciliary assessment form",
      httpStatusCode.INTERNAL_SERVER_ERROR,
      res
    );
  }
};

export const saveTrainingBookingService = async (
  payload: any,
  req: any,
  res: Response
) => {
  try {
    const {
      // Step 1 - Personal & Contact
      fullLegalName,
      preferredName,
      dateOfBirth,
      durationAtAddress,
      currentAddress,
      email,
      phoneNumber,
      nationalInsurance,
      
      // Step 2 - Emergency Contacts
      contactPhone,
      alternativeEmail,
      emergencyContactName,
      emergencyContactNumber,
      relationshipToLearner,
      preferredContactMethod,
      
      // Step 3 - Eligibility & Vetting
      rightToWorkStatus,
      dbsStatus,
      photoIdAvailable,
      proofOfAddress,
      
      // Step 4 - Experience & Qualifications
      trainingCourseRequired,
      currentRole,
      previousCareExperience,
      existingQualifications,
      preferredTrainingDate,
      trainingLocationPreference,
      
      // Step 5 - Health & Accessibility
      healthCondition,
      accessibilityRequirements,
      learningSupportNeeds,
      canAttendPractical,
      additionalNotes,
      
      // Step 6 - Declarations & Consents
      fullName,
      phoneNumberConfirmation,
      consentConfirmation,
      signatureName,
      
      // System fields
      source,
      formName,
    } = payload;

    // Validate required fields
    if (
      !fullLegalName ||
      !dateOfBirth ||
      !durationAtAddress ||
      !currentAddress ||
      !email ||
      !phoneNumber ||
      !nationalInsurance ||
      !contactPhone ||
      !emergencyContactName ||
      !emergencyContactNumber ||
      !rightToWorkStatus ||
      !dbsStatus ||
      !photoIdAvailable ||
      !proofOfAddress ||
      !trainingCourseRequired ||
      !fullName ||
      !phoneNumberConfirmation ||
      !consentConfirmation ||
      !signatureName
    ) {
      return errorResponseHandler(
        "All required fields must be filled",
        httpStatusCode.BAD_REQUEST,
        res
      );
    }

    // Validate email
    if (!email.includes('@') || !/\S+@\S+\.\S+/.test(email)) {
      return errorResponseHandler(
        "Invalid email format",
        httpStatusCode.BAD_REQUEST,
        res
      );
    }

    // Validate phone number (10-15 digits)
    const phoneRegex = /^[\d\s\-+()]{10,15}$/;
    if (!phoneRegex.test(phoneNumber.replace(/\s/g, ''))) {
      return errorResponseHandler(
        "Invalid phone number format",
        httpStatusCode.BAD_REQUEST,
        res
      );
    }

    // Validate National Insurance number format (basic)
    const niRegex = /^[A-CEGHJ-PR-TW-Z][A-CEGHJ-NPR-TW-Z]\d{6}[A-D]$/i;
    if (!niRegex.test(nationalInsurance.replace(/\s/g, ''))) {
      return errorResponseHandler(
        "Invalid National Insurance number format",
        httpStatusCode.BAD_REQUEST,
        res
      );
    }

    // Get IP and User Agent
    const ipAddress = req.ip || req.socket?.remoteAddress || null;
    const userAgent = req.headers?.["user-agent"] || null;

    // Save to database
    const formData = new trainingBookingModel({
      // Step 1 - Personal & Contact
      fullLegalName: fullLegalName.trim(),
      preferredName: preferredName ? preferredName.trim() : null,
      dateOfBirth,
      durationAtAddress: durationAtAddress.trim(),
      currentAddress: currentAddress.trim(),
      email: email.toLowerCase().trim(),
      phoneNumber: phoneNumber.trim(),
      nationalInsurance: nationalInsurance.trim().toUpperCase(),
      
      // Step 2 - Emergency Contacts
      contactPhone: contactPhone.trim(),
      alternativeEmail: alternativeEmail ? alternativeEmail.toLowerCase().trim() : null,
      emergencyContactName: emergencyContactName.trim(),
      emergencyContactNumber: emergencyContactNumber.trim(),
      relationshipToLearner: relationshipToLearner ? relationshipToLearner.trim() : null,
      preferredContactMethod: preferredContactMethod ? preferredContactMethod.trim() : null,
      
      // Step 3 - Eligibility & Vetting
      rightToWorkStatus: rightToWorkStatus.trim(),
      dbsStatus: dbsStatus.trim(),
      photoIdAvailable: photoIdAvailable.trim(),
      proofOfAddress: proofOfAddress.trim(),
      
      // Step 4 - Experience & Qualifications
      trainingCourseRequired: trainingCourseRequired.trim(),
      currentRole: currentRole ? currentRole.trim() : null,
      previousCareExperience: previousCareExperience ? previousCareExperience.trim() : null,
      existingQualifications: existingQualifications ? existingQualifications.trim() : null,
      preferredTrainingDate: preferredTrainingDate ? preferredTrainingDate.trim() : null,
      trainingLocationPreference: trainingLocationPreference ? trainingLocationPreference.trim() : null,
      
      // Step 5 - Health & Accessibility
      healthCondition: healthCondition ? healthCondition.trim() : null,
      accessibilityRequirements: accessibilityRequirements ? accessibilityRequirements.trim() : null,
      learningSupportNeeds: learningSupportNeeds ? learningSupportNeeds.trim() : null,
      canAttendPractical: canAttendPractical ? canAttendPractical.trim() : null,
      additionalNotes: additionalNotes ? additionalNotes.trim() : null,
      
      // Step 6 - Declarations & Consents
      fullName: fullName.trim(),
      phoneNumberConfirmation: phoneNumberConfirmation.trim(),
      consentConfirmation: consentConfirmation.trim(),
      signatureName: signatureName.trim(),
      
      // System fields
      ipAddress,
      userAgent,
      formName: formName || "Training Service Booking",
      source: source || "training-service-page",
    });

    await formData.save();

    return {
      success: true,
      message: "Training booking submitted successfully! We will contact you shortly.",
      data: {
        id: formData._id,
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        trainingCourse: formData.trainingCourseRequired,
        createdAt: formData.createdAt,
      },
    };

  } catch (error: any) {
    console.error("Error saving training booking:", error);
    return errorResponseHandler(
      error.message || "Failed to save training booking form",
      httpStatusCode.INTERNAL_SERVER_ERROR,
      res
    );
  }
};


export const saveFeedbackService = async (
  payload: any,
  req: any,
  res: Response
) => {
  try {
    const {
      firstName,
      lastName,
      fullName,
      phoneNumber,
      email,
      urgency,
      mood,
      feedbackMethod,
      message,
      attachmentUrl,
      videoUrl,
      audioUrl,
      attachmentFileName,
      videoFileName,
      audioDuration,
      source,
      formName,
    } = payload;

    // Validate required fields
    if (
      !firstName ||
      !lastName ||
      !fullName ||
      !phoneNumber ||
      !email ||
      !urgency ||
      !mood ||
      !feedbackMethod ||
      !message
    ) {
      return errorResponseHandler(
        "All required fields must be filled",
        httpStatusCode.BAD_REQUEST,
        res
      );
    }

    // Validate email
    if (!email.includes('@') || !/\S+@\S+\.\S+/.test(email)) {
      return errorResponseHandler(
        "Invalid email format",
        httpStatusCode.BAD_REQUEST,
        res
      );
    }

    // Validate phone number (10-15 digits)
    const phoneRegex = /^[\d\s\-+()]{10,15}$/;
    if (!phoneRegex.test(phoneNumber.replace(/\s/g, ''))) {
      return errorResponseHandler(
        "Invalid phone number format",
        httpStatusCode.BAD_REQUEST,
        res
      );
    }

    // Validate urgency
    if (!["low", "medium", "high"].includes(urgency)) {
      return errorResponseHandler(
        "Invalid urgency level",
        httpStatusCode.BAD_REQUEST,
        res
      );
    }

    // Validate mood
    if (!["happy", "neutral", "worried", "frustrated", "upset"].includes(mood)) {
      return errorResponseHandler(
        "Invalid mood selection",
        httpStatusCode.BAD_REQUEST,
        res
      );
    }

    // Validate feedback method
    if (!["write", "voice", "video"].includes(feedbackMethod)) {
      return errorResponseHandler(
        "Invalid feedback method",
        httpStatusCode.BAD_REQUEST,
        res
      );
    }

    // Get IP and User Agent
    const ipAddress = req.ip || req.socket?.remoteAddress || null;
    const userAgent = req.headers?.["user-agent"] || null;

    // Save to database
    const formData = new feedbackModel({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      fullName: fullName.trim(),
      phoneNumber: phoneNumber.trim(),
      email: email.toLowerCase().trim(),
      urgency,
      mood,
      feedbackMethod,
      message: message.trim(),
      attachmentUrl: attachmentUrl || null,
      videoUrl: videoUrl || null,
      audioUrl: audioUrl || null,
      attachmentFileName: attachmentFileName || null,
      videoFileName: videoFileName || null,
      audioDuration: audioDuration || 0,
      ipAddress,
      userAgent,
      formName: formName || "Feedback Form",
      source: source || "feedback-section",
      status: "pending",
    });

    await formData.save();

    return {
      success: true,
      message: "Feedback submitted successfully! The Registered Manager will review it promptly.",
      data: {
        id: formData._id,
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        urgency: formData.urgency,
        mood: formData.mood,
        feedbackMethod: formData.feedbackMethod,
        status: formData.status,
        createdAt: formData.createdAt,
      },
    };

  } catch (error: any) {
    console.error("Error saving feedback:", error);
    return errorResponseHandler(
      error.message || "Failed to save feedback form",
      httpStatusCode.INTERNAL_SERVER_ERROR,
      res
    );
  }
};





export const saveEnquiryService = async (
  payload: any,
  req: any,
  res: Response
) => {
  try {
    const {
      enquiryType,
      fullName,
      email,
      phoneNumber,
      additionalInfo,
      relationshipToClient,
      postcode,
      careType,
      timeframe,
      fundingType,
      organization,
      jobTitle,
      regions,
      supportRequired,
      timeline,
      source,
      formName,
    } = payload;

    // Validate required fields
    if (!enquiryType || !fullName || !email ) {
      return errorResponseHandler(
        "All required fields must be filled",
        httpStatusCode.BAD_REQUEST,
        res
      );
    }

    // Validate enquiry type
    if (!["care", "research"].includes(enquiryType)) {
      return errorResponseHandler(
        "Invalid enquiry type",
        httpStatusCode.BAD_REQUEST,
        res
      );
    }

    // Validate email
    if (!email.includes('@') || !/\S+@\S+\.\S+/.test(email)) {
      return errorResponseHandler(
        "Invalid email format",
        httpStatusCode.BAD_REQUEST,
        res
      );
    }

// Validate phone number only if provided
if (phoneNumber && phoneNumber.trim() !== "") {
  const phoneRegex = /^[\d\s\-+()]{10,15}$/;

  if (!phoneRegex.test(phoneNumber.replace(/\s/g, ""))) {
    return errorResponseHandler(
      "Invalid phone number format",
      httpStatusCode.BAD_REQUEST,
      res
    );
  }
}

    // Get IP and User Agent
    const ipAddress = req.ip || req.socket?.remoteAddress || null;
    const userAgent = req.headers?.["user-agent"] || null;

    // Save to database
    const formData = new enquiryModel({
      enquiryType,
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      phoneNumber: phoneNumber.trim(),
      additionalInfo: additionalInfo ? additionalInfo.trim() : null,
      
      // Care fields
      relationshipToClient: relationshipToClient || null,
      postcode: postcode || null,
      careType: careType || null,
      timeframe: timeframe || null,
      fundingType: fundingType || null,
      
      // Research fields
      organization: organization || null,
      jobTitle: jobTitle || null,
      regions: regions || null,
      supportRequired: supportRequired || null,
      timeline: timeline || null,
      
      // System fields
      ipAddress,
      userAgent,
      formName: formName || "Enquiry Form",
      source: source || "contact-us-page",
      status: "pending",
    });

    await formData.save();

    return {
      success: true,
      message: "Enquiry submitted successfully! We will contact you within one working day.",
      data: {
        id: formData._id,
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        enquiryType: formData.enquiryType,
        status: formData.status,
        createdAt: formData.createdAt,
      },
    };

  } catch (error: any) {
    console.error("Error saving enquiry:", error);
    return errorResponseHandler(
      error.message || "Failed to save enquiry form",
      httpStatusCode.INTERNAL_SERVER_ERROR,
      res
    );
  }
};





export const saveReferralService = async (
  payload: any,
  req: any,
  res: Response
) => {
  try {
    const {
      // Client Details
      firstName,
      lastName,
      clientFullName,
      dateOfBirth,
      currentLocation,
      phoneNumber,
      email,
      
      // Referrer Details
      organization,
      jobTitle,
      
      // Referral Details
      primaryReason,
      briefSummary,
      urgencyLevel,
      estimatedDischargeDate,
      additionalInfo,
      
      // File Uploads
      uploadedFile,
      uploadedFileName,
      uploadedFileUrl,
      
      // Consents
      consentData,
      consentReferral,
      
      // System fields
      source,
      formName,
      
      // Dynamic fields
      ...dynamicFields
    } = payload;

    // Determine which fields are available
    const fullName = clientFullName || `${firstName || ''} ${lastName || ''}`.trim() || null;
    const referrerName = `${firstName || ''} ${lastName || ''}`.trim() || null;
    const referrerOrganization = organization || null;
    const referrerJobTitle = jobTitle || null;
    const referralReason = briefSummary || primaryReason || null;

    // Validate required fields
    if (!fullName && !clientFullName) {
      return errorResponseHandler(
        "Client full name is required",
        httpStatusCode.BAD_REQUEST,
        res
      );
    }

    if (!phoneNumber) {
      return errorResponseHandler(
        "Phone number is required",
        httpStatusCode.BAD_REQUEST,
        res
      );
    }

    if (!email) {
      return errorResponseHandler(
        "Email address is required",
        httpStatusCode.BAD_REQUEST,
        res
      );
    }

    if (!referralReason) {
      return errorResponseHandler(
        "Brief summary of needs is required",
        httpStatusCode.BAD_REQUEST,
        res
      );
    }

    if (!currentLocation) {
      return errorResponseHandler(
        "Current location is required",
        httpStatusCode.BAD_REQUEST,
        res
      );
    }

    // Validate urgency level
    if (urgencyLevel && !["standard", "urgent"].includes(urgencyLevel)) {
      return errorResponseHandler(
        "Invalid urgency level",
        httpStatusCode.BAD_REQUEST,
        res
      );
    }

    // Validate email
    if (!email.includes('@') || !/\S+@\S+\.\S+/.test(email)) {
      return errorResponseHandler(
        "Invalid email format",
        httpStatusCode.BAD_REQUEST,
        res
      );
    }

    // Validate phone number (10-15 digits)
    const phoneRegex = /^[\d\s\-+()]{10,15}$/;
    if (!phoneRegex.test(phoneNumber.replace(/\s/g, ''))) {
      return errorResponseHandler(
        "Invalid phone number format",
        httpStatusCode.BAD_REQUEST,
        res
      );
    }

    // Get IP and User Agent
    const ipAddress = req.ip || req.socket?.remoteAddress || null;
    const userAgent = req.headers?.["user-agent"] || null;

    // Save to database
    const formData = new referralModel({
      // Client Details
      clientFullName: (clientFullName || fullName).trim(),
      firstName: firstName ? firstName.trim() : null,
      lastName: lastName ? lastName.trim() : null,
      dateOfBirth: dateOfBirth || null,
      currentLocation: currentLocation || null,
      phoneNumber: phoneNumber.trim(),
      email: email.toLowerCase().trim(),
      
      // Referrer Details
      referrerName: referrerName,
      referrerOrganization: referrerOrganization,
      referrerJobTitle: referrerJobTitle,
      
      // Referral Details
      referralReason: referralReason.trim(),
      urgencyLevel: urgencyLevel || "standard",
      estimatedDischargeDate: estimatedDischargeDate || null,
      additionalInfo: additionalInfo ? additionalInfo.trim() : null,
      
      // File Uploads
      uploadedFile: uploadedFileUrl || uploadedFile || null,
      uploadedFileName: uploadedFileName || null,
      
      // Consents
      consentData: consentData || false,
      consentReferral: consentReferral || false,
      
      // System fields
      ipAddress,
      userAgent,
      formName: formName || "Referral Form",
      source: source || "referral-form",
      status: "pending",
    });

    await formData.save();

    return {
      success: true,
      message: "Referral submitted successfully! We will review it promptly.",
      data: {
        id: formData._id,
        clientFullName: formData.clientFullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        urgencyLevel: formData.urgencyLevel,
        status: formData.status,
        createdAt: formData.createdAt,
      },
    };

  } catch (error: any) {
    console.error("Error saving referral:", error);
    return errorResponseHandler(
      error.message || "Failed to save referral form",
      httpStatusCode.INTERNAL_SERVER_ERROR,
      res
    );
  }
};


export const saveCareReadinessService = async (
  payload: any,
  req: any,
  res: Response
) => {
  try {
    const {
      fullName,
      email,
      phone,
      postcode,
      totalScore,
      scoreRange,
      resultTitle,
      resultDescription,
      considerations,
      answers,
      source,
      formName,
    } = payload;

    // Validate required fields
    if (!fullName || !email || !phone || !postcode) {
      return errorResponseHandler(
        "All personal details are required",
        httpStatusCode.BAD_REQUEST,
        res
      );
    }

    if (totalScore === undefined || totalScore === null) {
      return errorResponseHandler(
        "Assessment score is required",
        httpStatusCode.BAD_REQUEST,
        res
      );
    }

    // Validate email
    if (!email.includes('@') || !/\S+@\S+\.\S+/.test(email)) {
      return errorResponseHandler(
        "Invalid email format",
        httpStatusCode.BAD_REQUEST,
        res
      );
    }

    // Validate phone number
    const phoneRegex = /^[\d\s\-+()]{10,15}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      return errorResponseHandler(
        "Invalid phone number format",
        httpStatusCode.BAD_REQUEST,
        res
      );
    }

    // Validate postcode
    const postcodeRegex = /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i;
    if (!postcodeRegex.test(postcode)) {
      return errorResponseHandler(
        "Invalid UK postcode format",
        httpStatusCode.BAD_REQUEST,
        res
      );
    }

    // Get IP and User Agent
    const ipAddress = req.ip || req.socket?.remoteAddress || null;
    const userAgent = req.headers?.["user-agent"] || null;

    // Save to database
    const formData = new careReadinessModel({
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      postcode: postcode.trim().toUpperCase(),
      totalScore,
      scoreRange,
      resultTitle,
      resultDescription,
      considerations: considerations || [],
      answers: answers || {},
      ipAddress,
      userAgent,
      formName: formName || "Care Readiness Assessment",
      source: source || "care-readiness-tool",
      status: "pending",
    });

    await formData.save();

    return {
      success: true,
      message: "Assessment submitted successfully! A care advisor will contact you shortly.",
      data: {
        id: formData._id,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        totalScore: formData.totalScore,
        resultTitle: formData.resultTitle,
        status: formData.status,
        createdAt: formData.createdAt,
      },
    };

  } catch (error: any) {
    console.error("Error saving care readiness assessment:", error);
    return errorResponseHandler(
      error.message || "Failed to save assessment",
      httpStatusCode.INTERNAL_SERVER_ERROR,
      res
    );
  }
};




export const saveFundingPathwayService = async (
  payload: any,
  req: any,
  res: Response
) => {
  try {
    const {
      // Step 1 - Care Needs Assessment
      age,
      careLevel,
      careSetting,
      complexNeeds,
      
      // Step 2 - Funding Eligibility
      assets,
      income,
      medicalSupport,
      
      // Step 3 - Contact Details
      fullName,
      contactMethod,
      email,
      phone,
      
      // System fields
      source,
      formName,
    } = payload;

    // Validate Step 1 - Care Needs Assessment
    if (!age) {
      return errorResponseHandler(
        "Age of care recipient is required",
        httpStatusCode.BAD_REQUEST,
        res
      );
    }

    if (!careLevel) {
      return errorResponseHandler(
        "Level of care needed is required",
        httpStatusCode.BAD_REQUEST,
        res
      );
    }

    if (!careSetting) {
      return errorResponseHandler(
        "Care setting is required",
        httpStatusCode.BAD_REQUEST,
        res
      );
    }

    // Validate Step 2 - Funding Eligibility
    if (!assets) {
      return errorResponseHandler(
        "Assets and savings information is required",
        httpStatusCode.BAD_REQUEST,
        res
      );
    }

    if (!income) {
      return errorResponseHandler(
        "Monthly income level is required",
        httpStatusCode.BAD_REQUEST,
        res
      );
    }

    // Validate medicalSupport - handle both string and boolean
    if (medicalSupport === undefined || medicalSupport === null) {
      return errorResponseHandler(
        "Medical support information is required",
        httpStatusCode.BAD_REQUEST,
        res
      );
    }

    // Validate Step 3 - Contact Details
    if (!fullName || !fullName.trim()) {
      return errorResponseHandler(
        "Full name is required",
        httpStatusCode.BAD_REQUEST,
        res
      );
    }

    if (!contactMethod) {
      return errorResponseHandler(
        "Preferred contact method is required",
        httpStatusCode.BAD_REQUEST,
        res
      );
    }

    if (!email || !email.trim()) {
      return errorResponseHandler(
        "Email address is required",
        httpStatusCode.BAD_REQUEST,
        res
      );
    }

    if (!phone || !phone.trim()) {
      return errorResponseHandler(
        "Phone number is required",
        httpStatusCode.BAD_REQUEST,
        res
      );
    }

    // Validate email format
    if (!email.includes('@') || !/\S+@\S+\.\S+/.test(email)) {
      return errorResponseHandler(
        "Invalid email format",
        httpStatusCode.BAD_REQUEST,
        res
      );
    }

    // Validate phone number (10-15 digits)
    const phoneRegex = /^[\d\s\-+()]{10,15}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      return errorResponseHandler(
        "Invalid phone number format. Please enter 10-15 digits.",
        httpStatusCode.BAD_REQUEST,
        res
      );
    }

    // Validate age enum
    const validAges = ["Under 18", "18-64", "65-84", "85+"];
    if (!validAges.includes(age)) {
      return errorResponseHandler(
        "Invalid age range selected",
        httpStatusCode.BAD_REQUEST,
        res
      );
    }

    // Validate care level enum
    const validCareLevels = ["basic", "moderate", "extensive"];
    if (!validCareLevels.includes(careLevel)) {
      return errorResponseHandler(
        "Invalid care level selected",
        httpStatusCode.BAD_REQUEST,
        res
      );
    }

    // Validate care setting enum
    const validCareSettings = ["own-home", "with-family", "care-facility"];
    if (!validCareSettings.includes(careSetting)) {
      return errorResponseHandler(
        "Invalid care setting selected",
        httpStatusCode.BAD_REQUEST,
        res
      );
    }

    // Validate assets enum
    const validAssets = ["under-23250", "23250-100000", "over-100000"];
    if (!validAssets.includes(assets)) {
      return errorResponseHandler(
        "Invalid assets range selected",
        httpStatusCode.BAD_REQUEST,
        res
      );
    }

    // Validate income enum
    const validIncomes = ["Below £1,000/month", "£1,000 - £3,000/month", "Above £3,000/month"];
    if (!validIncomes.includes(income)) {
      return errorResponseHandler(
        "Invalid income level selected",
        httpStatusCode.BAD_REQUEST,
        res
      );
    }

    // Validate contact method enum
    const validContactMethods = ["email", "phone", "text"];
    if (!validContactMethods.includes(contactMethod)) {
      return errorResponseHandler(
        "Invalid contact method selected",
        httpStatusCode.BAD_REQUEST,
        res
      );
    }

    // Get IP and User Agent
    const ipAddress = req.ip || req.socket?.remoteAddress || null;
    const userAgent = req.headers?.["user-agent"] || null;

    // Convert string 'true'/'false' to boolean if needed
    const isComplexNeeds = typeof complexNeeds === 'string' 
      ? complexNeeds === 'true' 
      : Boolean(complexNeeds);
    
    const isMedicalSupport = typeof medicalSupport === 'string'
      ? medicalSupport === 'true'
      : Boolean(medicalSupport);

    // Save to database
    const formData = new fundingPathwayModel({
      // Step 1
      age,
      careLevel,
      careSetting,
      complexNeeds: isComplexNeeds,
      
      // Step 2
      assets,
      income,
      medicalSupport: isMedicalSupport,
      
      // Step 3
      fullName: fullName.trim(),
      contactMethod,
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      
      // System fields
      ipAddress,
      userAgent,
      formName: formName || "Funding Pathway Assessment",
      source: source || "funding-pathway",
      status: "pending",
    });

    await formData.save();

    return {
      success: true,
      message: "Funding pathway assessment submitted successfully! We will send you the results shortly.",
      data: {
        id: formData._id,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        age: formData.age,
        careLevel: formData.careLevel,
        assets: formData.assets,
        status: formData.status,
        createdAt: formData.createdAt,
      },
    };

  } catch (error: any) {
    console.error("Error saving funding pathway assessment:", error);
    return errorResponseHandler(
      error.message || "Failed to save funding pathway assessment",
      httpStatusCode.INTERNAL_SERVER_ERROR,
      res
    );
  }
};



export const saveCareCostService = async (
  payload: any,
  req: any,
  res: Response
) => {
  try {
    const {
      // Personal Details
      fullName,
      email,
      phone,
      postcode,
      
      // Care Details
      careFrequency,
      personalCareLevel,
      mobilityLevel,
      
      // Specialist Care
      specialistCare,
      
      // Estimated Cost
      estimatedCost,
      
      // System fields
      source,
      formName,
    } = payload;

    // Validate Personal Details
    if (!fullName || !fullName.trim()) {
      return errorResponseHandler(
        "Full name is required",
        httpStatusCode.BAD_REQUEST,
        res
      );
    }

    if (!email || !email.trim()) {
      return errorResponseHandler(
        "Email address is required",
        httpStatusCode.BAD_REQUEST,
        res
      );
    }

    if (!phone || !phone.trim()) {
      return errorResponseHandler(
        "Phone number is required",
        httpStatusCode.BAD_REQUEST,
        res
      );
    }

    if (!postcode || !postcode.trim()) {
      return errorResponseHandler(
        "Postcode is required",
        httpStatusCode.BAD_REQUEST,
        res
      );
    }

    // Validate email format
    if (!email.includes('@') || !/\S+@\S+\.\S+/.test(email)) {
      return errorResponseHandler(
        "Invalid email format",
        httpStatusCode.BAD_REQUEST,
        res
      );
    }

    // Validate phone number (10-15 digits)
    const phoneRegex = /^[\d\s\-+()]{10,15}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      return errorResponseHandler(
        "Invalid phone number format. Please enter 10-15 digits.",
        httpStatusCode.BAD_REQUEST,
        res
      );
    }

    // Validate postcode (UK format)
    const postcodeRegex = /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i;
    if (!postcodeRegex.test(postcode)) {
      return errorResponseHandler(
        "Invalid UK postcode format",
        httpStatusCode.BAD_REQUEST,
        res
      );
    }

    // Validate Care Details
    if (!careFrequency) {
      return errorResponseHandler(
        "Care frequency is required",
        httpStatusCode.BAD_REQUEST,
        res
      );
    }

    if (!personalCareLevel) {
      return errorResponseHandler(
        "Personal care level is required",
        httpStatusCode.BAD_REQUEST,
        res
      );
    }

    if (!mobilityLevel) {
      return errorResponseHandler(
        "Mobility level is required",
        httpStatusCode.BAD_REQUEST,
        res
      );
    }

    // Validate estimated cost
    if (!estimatedCost) {
      return errorResponseHandler(
        "Estimated cost is required",
        httpStatusCode.BAD_REQUEST,
        res
      );
    }

    // Get IP and User Agent
    const ipAddress = req.ip || req.socket?.remoteAddress || null;
    const userAgent = req.headers?.["user-agent"] || null;

    // Extract specialist care values
    const dementia = specialistCare?.dementia || false;
    const palliative = specialistCare?.palliative || false;
    const neurological = specialistCare?.neurological || false;

    // Save to database
    const formData = new careCostModel({
      // Personal Details
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      postcode: postcode.trim().toUpperCase(),
      
      // Care Details
      careFrequency,
      personalCareLevel,
      mobilityLevel,
      
      // Specialist Care
      dementiaCare: dementia,
      palliativeCare: palliative,
      neurologicalSupport: neurological,
      
      // Estimated Cost
      estimatedCost,
      
      // System fields
      ipAddress,
      userAgent,
      formName: formName || "Care Cost Calculator",
      source: source || "care-cost-calculator",
      status: "pending",
    });

    await formData.save();

    return {
      success: true,
      message: "Care cost estimate submitted successfully! We will send you the details shortly.",
      data: {
        id: formData._id,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        postcode: formData.postcode,
        estimatedCost: formData.estimatedCost,
        status: formData.status,
        createdAt: formData.createdAt,
      },
    };

  } catch (error: any) {
    console.error("Error saving care cost estimate:", error);
    return errorResponseHandler(
      error.message || "Failed to save care cost estimate",
      httpStatusCode.INTERNAL_SERVER_ERROR,
      res
    );
  }
};
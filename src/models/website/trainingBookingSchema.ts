// models/website/trainingBookingSchema.ts
import { Schema, model } from "mongoose";

const TrainingBookingSchema = new Schema(
  {
    // Step 1 - Personal & Contact
    fullLegalName: {
      type: String,
      required: true,
      trim: true,
    },
    preferredName: {
      type: String,
      default: null,
    },
    dateOfBirth: {
      type: String,
      required: true,
    },
    durationAtAddress: {
      type: String,
      required: true,
      trim: true,
    },
    currentAddress: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    nationalInsurance: {
      type: String,
      required: true,
      trim: true,
    },

    // Step 2 - Emergency Contacts
    contactPhone: {
      type: String,
      required: true,
      trim: true,
    },
    alternativeEmail: {
      type: String,
      default: null,
    },
    emergencyContactName: {
      type: String,
      required: true,
      trim: true,
    },
    emergencyContactNumber: {
      type: String,
      required: true,
      trim: true,
    },
    relationshipToLearner: {
      type: String,
      default: null,
    },
    preferredContactMethod: {
      type: String,
      default: null,
    },

    // Step 3 - Eligibility & Vetting
    rightToWorkStatus: {
      type: String,
      required: true,
      trim: true,
    },
    dbsStatus: {
      type: String,
      required: true,
      trim: true,
    },
    photoIdAvailable: {
      type: String,
      required: true,
      trim: true,
    },
    proofOfAddress: {
      type: String,
      required: true,
      trim: true,
    },

    // Step 4 - Experience & Qualifications
    trainingCourseRequired: {
      type: String,
      required: true,
      trim: true,
    },
    currentRole: {
      type: String,
      default: null,
    },
    previousCareExperience: {
      type: String,
      default: null,
    },
    existingQualifications: {
      type: String,
      default: null,
    },
    preferredTrainingDate: {
      type: String,
      default: null,
    },
    trainingLocationPreference: {
      type: String,
      default: null,
    },

    // Step 5 - Health & Accessibility
    healthCondition: {
      type: String,
      default: null,
    },
    accessibilityRequirements: {
      type: String,
      default: null,
    },
    learningSupportNeeds: {
      type: String,
      default: null,
    },
    canAttendPractical: {
      type: String,
      default: null,
    },
    additionalNotes: {
      type: String,
      default: null,
    },

    // Step 6 - Declarations & Consents
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    phoneNumberConfirmation: {
      type: String,
      required: true,
      trim: true,
    },
    consentConfirmation: {
      type: String,
      required: true,
      trim: true,
    },
    signatureName: {
      type: String,
      required: true,
      trim: true,
    },

    // System fields
    formName: {
      type: String,
      default: "Training Service Booking",
    },
    ipAddress: {
      type: String,
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
    },
    source: {
      type: String,
      default: "training-service-page",
    },
  },
  {
    timestamps: true,
  }
);

export const trainingBookingModel = model("training_bookings", TrainingBookingSchema);
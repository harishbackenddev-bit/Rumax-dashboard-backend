// models/website/trialSupportSchema.ts
import { Schema, model } from "mongoose";

const TrialSupportSchema = new Schema(
  {
    // Step 1 - Study Details
    studyPhase: {
      type: [String],
      enum: ["Phase I", "Phase II", "Phase III", "Phase IV", "Phase V"],
      default: [],
    },
    therapeuticArea: {
      type: [String],
      enum: ["Oncology", "CNS", "Infectious Disease", "Cardiovascular", "Immunology", "Rare Diseases"],
      default: [],
    },
    
    // Step 2 - Bottlenecks
    description: {
      type: String,
      default: null,
    },
    
    // Step 3 - About You
    fullName: {
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
    designation: {
      type: String,
      required: true,
      trim: true,
    },
    companyWebsite: {
      type: String,
      default: null,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    preferredDate: {
      type: String,
      required: true,
    },
    preferredTime: {
      type: String,
      required: true,
    },
    timezone: {
      type: String,
      default: null,
    },
    country: {
      type: String,
      default: null,
    },
    
    // System fields
    formName: {
      type: String,
      default: "Trial Support Form",
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
      default: "trial-support-form",
    },
  },
  {
    timestamps: true,
  }
);

export const trialSupportModel = model("trial_support_forms", TrialSupportSchema);
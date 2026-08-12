// models/website/feasibilitySchema.ts
import { Schema, model } from "mongoose";

const FeasibilitySchema = new Schema(
  {
    // Step 1
    whoAreYou: {
      type: String,
      enum: ["Sponsor", "CRO", "Investigator Site", "NHS Trust", "Other"],
      required: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    workEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    areasOfInterest: {
      type: [String],
      enum: [
        "Homecare Visit Management",
        "Direct-to-Patient Logistics",
        "Site Administrative Support",
        "Regulatory & Compliance Training",
        "Feasibility & Recruitment Support",
      ],
      default: [],
    },

    // Step 2
    studyPhase: {
      type: String,
      enum: ["Phase I", "Phase II", "Phase III", "Phase IV", "Phase V"],
      required: true,
    },
    patientEnrollment: {
      type: String,
      required: true,
    },
    trialDuration: {
      type: Number,
      required: true,
      min: 1,
      max: 36,
    },
    diseaseIndication: {
      type: String,
      enum: ["Oncology", "Cardiology", "Neurology", "Infectious Disease", "Other"],
      required: true,
    },
    studyStartDate: {
      type: String,
      enum: ["Within 3 months", "3-6 months", "6-12 months", "12+ months"],
      required: true,
    },
    operationalChallenges: {
      type: [String],
      enum: [
        "Site Logistics",
        "Homecare Coordination",
        "Patient Recruitment",
        "Monitoring Oversight",
        "Data Management",
        "Other",
      ],
      default: [],
    },
    additionalComments: {
      type: String,
      default: null,
    },

    // System fields
    formName: {
      type: String,
      default: "Trial Feasibility Assessment",
    },
    status: {
      type: String,
      enum: ["pending", "reviewing", "contacted", "completed"],
      default: "pending",
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
      default: "feasibility-assessment-form",
    },
    processedAt: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
FeasibilitySchema.index({ workEmail: 1 });
FeasibilitySchema.index({ createdAt: -1 });

export const feasibilityModel = model("feasibility_assessments", FeasibilitySchema);
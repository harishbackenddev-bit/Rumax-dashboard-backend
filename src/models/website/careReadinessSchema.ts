// models/website/careReadinessSchema.ts
import { Schema, model } from "mongoose";

const CareReadinessSchema = new Schema(
  {
    // Personal Details
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
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    postcode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    
    // Assessment Results
    totalScore: {
      type: Number,
      required: true,
    },
    scoreRange: {
      type: String,
      required: true,
    },
    resultTitle: {
      type: String,
      required: true,
    },
    resultDescription: {
      type: String,
      required: true,
    },
    considerations: {
      type: [String],
      default: [],
    },
    
    // Individual Answers
    answers: {
      type: Map,
      of: Number,
      default: {},
    },
    
    // System fields
    formName: {
      type: String,
      default: "Care Readiness Assessment",
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
      default: "care-readiness-tool",
    },
    status: {
      type: String,
      enum: ["pending", "contacted", "consultation_scheduled", "completed"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes
CareReadinessSchema.index({ email: 1 });
CareReadinessSchema.index({ phone: 1 });
CareReadinessSchema.index({ postcode: 1 });
CareReadinessSchema.index({ totalScore: 1 });
CareReadinessSchema.index({ createdAt: -1 });

// Pre-save middleware
CareReadinessSchema.pre('save', function(next) {
  if (this.email) {
    this.email = this.email.toLowerCase().trim();
  }
  if (this.postcode) {
    this.postcode = this.postcode.trim().toUpperCase();
  }
  next();
});

export const careReadinessModel = model("care_readiness_assessments", CareReadinessSchema);
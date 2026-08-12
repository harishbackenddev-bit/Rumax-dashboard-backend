// models/website/fundingPathwaySchema.ts
import { Schema, model } from "mongoose";

const FundingPathwaySchema = new Schema(
  {
    // Step 1 - Care Needs Assessment
    age: {
      type: String,
      required: true,
      enum: ["Under 18", "18-64", "65-84", "85+"],
    },
    careLevel: {
      type: String,
      required: true,
      enum: ["basic", "moderate", "extensive"],
    },
    careSetting: {
      type: String,
      required: true,
      enum: ["own-home", "with-family", "care-facility"],
    },
    complexNeeds: {
      type: Boolean,
      default: false,
    },
    
    // Step 2 - Funding Eligibility
    assets: {
      type: String,
      required: true,
      enum: ["under-23250", "23250-100000", "over-100000"],
    },
    income: {
      type: String,
      required: true,
      enum: ["Below £1,000/month", "£1,000 - £3,000/month", "Above £3,000/month"],
    },
    medicalSupport: {
      type: Boolean,
      default: false,
    },
    
    // Step 3 - Contact Details
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    contactMethod: {
      type: String,
      required: true,
      enum: ["email", "phone", "text"],
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
    
    // System fields
    formName: {
      type: String,
      default: "Funding Pathway Assessment",
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
      default: "funding-pathway",
    },
    status: {
      type: String,
      enum: ["pending", "contacted", "completed"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes
FundingPathwaySchema.index({ email: 1 });
FundingPathwaySchema.index({ phone: 1 });
FundingPathwaySchema.index({ status: 1 });
FundingPathwaySchema.index({ createdAt: -1 });

export const fundingPathwayModel = model("funding_pathways", FundingPathwaySchema);
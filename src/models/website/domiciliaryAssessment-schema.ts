// models/website/domiciliaryAssessmentSchema.ts
import { Schema, model } from "mongoose";

const DomiciliaryAssessmentSchema = new Schema(
  {
    // Personal Information
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    phoneNumber: {
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
    postcode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    
    // Care Details
    relationship: {
      type: String,
      required: true,
      enum: [
        "Self",
        "Spouse/Partner",
        "Parent",
        "Child",
        "Sibling",
        "Grandparent",
        "Grandchild",
        "Friend",
        "Other Family Member",
        "Professional (Social Worker/Care Manager)"
      ],
    },
    careType: {
      type: [String],
      required: true,
      enum: [
        "Personal Care",
        "Dementia Care",
        "Medication Management",
        "Respite Care",
        "24-Hour/Live-In Care",
        "Supported Living",
        "Companionship",
        "Palliative/End of Life Care",
        "Hospital Discharge Support",
        "Home Help (Cleaning, Shopping)"
      ],
      default: [],
    },
    timeframe: {
      type: String,
      required: true,
      enum: [
        "Immediately (Within 24 hours)",
        "Within 1 week",
        "Within 2 weeks",
        "Within 1 month",
        "Within 3 months",
        "Planning for future (3-6 months)",
        "Not sure yet"
      ],
    },
    fundingType: {
      type: String,
      enum: [
        "Self-Funded (Private)",
        "Local Authority (Council Funded)",
        "NHS Continuing Healthcare",
        "Personal Budget/Direct Payment",
        "Health Insurance",
        "Combination of sources",
        "Not sure / Undecided"
      ],
      default: "Not specified",
    },
    additionalInfo: {
      type: String,
      default: null,
    },
    
    // Consent
    consent: {
      type: Boolean,
      required: true,
      default: false,
    },
    
    // System fields
    formName: {
      type: String,
      default: "Domiciliary Care Assessment",
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
      default: "domiciliary-care-page",
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes for better query performance
DomiciliaryAssessmentSchema.index({ email: 1 });
DomiciliaryAssessmentSchema.index({ phoneNumber: 1 });
DomiciliaryAssessmentSchema.index({ postcode: 1 });
DomiciliaryAssessmentSchema.index({ createdAt: -1 });
DomiciliaryAssessmentSchema.index({ source: 1 });
DomiciliaryAssessmentSchema.index({ formName: 1 });

// Pre-save middleware to format data
DomiciliaryAssessmentSchema.pre('save', function(next) {
  // Format postcode to uppercase and trim
  if (this.postcode) {
    this.postcode = this.postcode.trim().toUpperCase();
  }
  
  // Trim additional info
  if (this.additionalInfo) {
    this.additionalInfo = this.additionalInfo.trim();
  }
  
  next();
});

export const domiciliaryAssessmentModel = model("domiciliary_assessment_forms", DomiciliaryAssessmentSchema);
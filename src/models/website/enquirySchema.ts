// models/website/enquirySchema.ts
import { Schema, model } from "mongoose";

const EnquirySchema = new Schema(
  {
    // Common fields
    enquiryType: {
      type: String,
      required: true,
      enum: ["care", "research"],
    },
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
    phoneNumber: {
      type: String,
      trim: true,
    },
    additionalInfo: {
      type: String,
      default: null,
    },
    
    // Care enquiry fields
    relationshipToClient: {
      type: String,
      default: null,
    },
    postcode: {
      type: String,
      default: null,
    },
    careType: {
      type: String,
      default: null,
    },
    timeframe: {
      type: String,
      default: null,
    },
    fundingType: {
      type: String,
      default: null,
    },
    
    // Research enquiry fields
    organization: {
      type: String,
      default: null,
    },
    jobTitle: {
      type: String,
      default: null,
    },
    regions: {
      type: String,
      default: null,
    },
    supportRequired: {
      type: String,
      default: null,
    },
    timeline: {
      type: String,
      default: null,
    },
    
    // System fields
    formName: {
      type: String,
      default: "Enquiry Form",
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
      default: "contact-us-page",
    },
    status: {
      type: String,
      enum: ["pending", "contacted", "assessment_scheduled", "converted", "closed"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes for better query performance
EnquirySchema.index({ email: 1 });
EnquirySchema.index({ phoneNumber: 1 });
EnquirySchema.index({ enquiryType: 1 });
EnquirySchema.index({ status: 1 });
EnquirySchema.index({ createdAt: -1 });
EnquirySchema.index({ source: 1 });

// Pre-save middleware to format data
EnquirySchema.pre('save', function(next) {
  // Format email to lowercase
  if (this.email) {
    this.email = this.email.toLowerCase().trim();
  }
  
  // Trim all string fields
  if (this.fullName) {
    this.fullName = this.fullName.trim();
  }
  if (this.phoneNumber) {
    this.phoneNumber = this.phoneNumber.trim();
  }
  if (this.additionalInfo) {
    this.additionalInfo = this.additionalInfo.trim();
  }
  
  next();
});

// Static method to get statistics
EnquirySchema.statics.getStats = async function() {
  const total = await this.countDocuments();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayCount = await this.countDocuments({
    createdAt: { $gte: today }
  });
  
  const typeStats = await this.aggregate([
    { $group: { _id: '$enquiryType', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  
  const statusStats = await this.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  
  return {
    total,
    today: todayCount,
    typeStats,
    statusStats
  };
};

// Static method to find by email
EnquirySchema.statics.findByEmail = function(email: string) {
  return this.find({ email: email.toLowerCase().trim() });
};

// Static method to find by status
EnquirySchema.statics.findByStatus = function(status: string) {
  return this.find({ status });
};

// Static method to find by enquiry type
EnquirySchema.statics.findByType = function(type: string) {
  return this.find({ enquiryType: type });
};

export const enquiryModel = model("enquiries", EnquirySchema);
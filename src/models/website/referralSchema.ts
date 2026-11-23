
import { Schema, model } from "mongoose";

const ReferralSchema = new Schema(
  {
    
    clientFullName: {
      type: String,
      required: true,
      trim: true,
    },
    firstName: {
      type: String,
      trim: true,
      default: null,
    },
    lastName: {
      type: String,
      trim: true,
      default: null,
    },
    dateOfBirth: {
      type: String,
      default: null,
    },
    currentLocation: {
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
    
    
    referrerName: {
      type: String,
      trim: true,
      default: null,
    },
    referrerOrganization: {
      type: String,
      trim: true,
      default: null,
    },
    referrerJobTitle: {
      type: String,
      trim: true,
      default: null,
    },
    
    
    referralReason: {
      type: String,
      required: true,
      trim: true,
    },
    urgencyLevel: {
      type: String,
      enum: ["standard", "urgent"],
      default: "standard",
    },
    estimatedDischargeDate: {
      type: String,
      default: null,
    },
    additionalInfo: {
      type: String,
      default: null,
    },
    
    
    uploadedFile: {
      type: String,
      default: null,
    },
    uploadedFileName: {
      type: String,
      default: null,
    },
    
    
    consentData: {
      type: Boolean,
      default: false,
    },
    consentReferral: {
      type: Boolean,
      default: false,
    },
    
    
    formName: {
      type: String,
      default: "Referral Form",
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
      default: "referral-form",
    },
    status: {
      type: String,
      enum: ["pending", "reviewed", "in_progress", "completed", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);


ReferralSchema.index({ email: 1 });
ReferralSchema.index({ phoneNumber: 1 });
ReferralSchema.index({ status: 1 });
ReferralSchema.index({ urgencyLevel: 1 });
ReferralSchema.index({ createdAt: -1 });
ReferralSchema.index({ clientFullName: 1 });


ReferralSchema.pre('save', function(next) {
  
  if (this.email) {
    this.email = this.email.toLowerCase().trim();
  }
  
  
  if (this.clientFullName) {
    this.clientFullName = this.clientFullName.trim();
  }
  if (this.phoneNumber) {
    this.phoneNumber = this.phoneNumber.trim();
  }
  if (this.referralReason) {
    this.referralReason = this.referralReason.trim();
  }
  if (this.additionalInfo) {
    this.additionalInfo = this.additionalInfo.trim();
  }
  if (this.currentLocation) {
    this.currentLocation = this.currentLocation.trim();
  }
  
  next();
});


ReferralSchema.statics.getStats = async function() {
  const total = await this.countDocuments();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayCount = await this.countDocuments({
    createdAt: { $gte: today }
  });
  
  const statusStats = await this.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  
  const urgencyStats = await this.aggregate([
    { $group: { _id: '$urgencyLevel', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  
  return {
    total,
    today: todayCount,
    statusStats,
    urgencyStats
  };
};


ReferralSchema.statics.findByEmail = function(email: string) {
  return this.find({ email: email.toLowerCase().trim() });
};


ReferralSchema.statics.findByStatus = function(status: string) {
  return this.find({ status });
};


ReferralSchema.statics.findByUrgency = function(level: string) {
  return this.find({ urgencyLevel: level });
};

export const referralModel = model("referrals", ReferralSchema);
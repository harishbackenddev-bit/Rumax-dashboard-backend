// models/website/careCostSchema.ts
import { Schema, model } from "mongoose";

const CareCostSchema = new Schema(
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
    
    // Care Details
    careFrequency: {
      type: String,
      required: true,
      enum: [
        "Just a few hours (1-5 hrs)",
        "Daily Visits",
        "Overnight Support",
        "Full Live-in Care"
      ],
    },
    personalCareLevel: {
      type: String,
      required: true,
      enum: [
        "Companionship & Housekeeping",
        "Help with Washing & Dressing",
        "Complete/Medical Administration"
      ],
    },
    mobilityLevel: {
      type: String,
      required: true,
      enum: [
        "Fully Independent",
        "Needs Steadying/Walking Aids",
        "Requires Hoisting/Two Carers"
      ],
    },
    
    // Specialist Care
    dementiaCare: {
      type: Boolean,
      default: false,
    },
    palliativeCare: {
      type: Boolean,
      default: false,
    },
    neurologicalSupport: {
      type: Boolean,
      default: false,
    },
    
    // Estimated Cost
    estimatedCost: {
      type: String,
      required: true,
    },
    
    // System fields
    formName: {
      type: String,
      default: "Care Cost Calculator",
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
      default: "care-cost-calculator",
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

// Add indexes for better query performance
CareCostSchema.index({ email: 1 });
CareCostSchema.index({ phone: 1 });
CareCostSchema.index({ postcode: 1 });
CareCostSchema.index({ status: 1 });
CareCostSchema.index({ createdAt: -1 });
CareCostSchema.index({ source: 1 });

// Pre-save middleware to format data
CareCostSchema.pre('save', function(next) {
  // Format email to lowercase
  if (this.email) {
    this.email = this.email.toLowerCase().trim();
  }
  
  // Format postcode to uppercase
  if (this.postcode) {
    this.postcode = this.postcode.trim().toUpperCase();
  }
  
  // Trim all string fields
  if (this.fullName) {
    this.fullName = this.fullName.trim();
  }
  if (this.phone) {
    this.phone = this.phone.trim();
  }
  
  next();
});

// Static method to get statistics
CareCostSchema.statics.getStats = async function() {
  const total = await this.countDocuments();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayCount = await this.countDocuments({
    createdAt: { $gte: today }
  });
  
  const frequencyStats = await this.aggregate([
    { $group: { _id: '$careFrequency', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  
  const statusStats = await this.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  
  const specialistStats = await this.aggregate([
    {
      $project: {
        hasSpecialist: {
          $or: ['$dementiaCare', '$palliativeCare', '$neurologicalSupport']
        }
      }
    },
    { $group: { _id: '$hasSpecialist', count: { $sum: 1 } } }
  ]);
  
  return {
    total,
    today: todayCount,
    frequencyStats,
    statusStats,
    specialistStats
  };
};

// Static method to find by email
CareCostSchema.statics.findByEmail = function(email: string) {
  return this.find({ email: email.toLowerCase().trim() });
};

// Static method to find by status
CareCostSchema.statics.findByStatus = function(status: string) {
  return this.find({ status });
};

// Static method to find by postcode
CareCostSchema.statics.findByPostcode = function(postcode: string) {
  return this.find({ postcode: postcode.trim().toUpperCase() });
};

export const careCostModel = model("care_cost_estimates", CareCostSchema);
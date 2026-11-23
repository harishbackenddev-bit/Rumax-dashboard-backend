
import { Schema, model } from "mongoose";

const CareCostSchema = new Schema(
  {
    
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
    
    
    estimatedCost: {
      type: String,
      required: true,
    },
    
    
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


CareCostSchema.index({ email: 1 });
CareCostSchema.index({ phone: 1 });
CareCostSchema.index({ postcode: 1 });
CareCostSchema.index({ status: 1 });
CareCostSchema.index({ createdAt: -1 });
CareCostSchema.index({ source: 1 });


CareCostSchema.pre('save', function(next) {
  
  if (this.email) {
    this.email = this.email.toLowerCase().trim();
  }
  
  
  if (this.postcode) {
    this.postcode = this.postcode.trim().toUpperCase();
  }
  
  
  if (this.fullName) {
    this.fullName = this.fullName.trim();
  }
  if (this.phone) {
    this.phone = this.phone.trim();
  }
  
  next();
});


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


CareCostSchema.statics.findByEmail = function(email: string) {
  return this.find({ email: email.toLowerCase().trim() });
};


CareCostSchema.statics.findByStatus = function(status: string) {
  return this.find({ status });
};


CareCostSchema.statics.findByPostcode = function(postcode: string) {
  return this.find({ postcode: postcode.trim().toUpperCase() });
};

export const careCostModel = model("care_cost_estimates", CareCostSchema);
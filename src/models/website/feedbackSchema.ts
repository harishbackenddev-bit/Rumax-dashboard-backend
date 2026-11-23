
import { Schema, model } from "mongoose";

const FeedbackSchema = new Schema(
  {
    
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
    
    
    urgency: {
      type: String,
      required: true,
      enum: ["low", "medium", "high"],
    },
    mood: {
      type: String,
      required: true,
      enum: ["happy", "neutral", "worried", "frustrated", "upset"],
    },
    feedbackMethod: {
      type: String,
      required: true,
      enum: ["write", "voice", "video"],
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    
    
    attachmentUrl: {
      type: String,
      default: null,
    },
    videoUrl: {
      type: String,
      default: null,
    },
    audioUrl: {
      type: String,
      default: null,
    },
    attachmentFileName: {
      type: String,
      default: null,
    },
    videoFileName: {
      type: String,
      default: null,
    },
    audioDuration: {
      type: Number,
      default: 0,
    },
    
    
    formName: {
      type: String,
      default: "Feedback Form",
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
      default: "feedback-section",
    },
    status: {
      type: String,
      enum: ["pending", "reviewed", "resolved", "closed"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);


FeedbackSchema.index({ email: 1 });
FeedbackSchema.index({ phoneNumber: 1 });
FeedbackSchema.index({ status: 1 });
FeedbackSchema.index({ createdAt: -1 });
FeedbackSchema.index({ source: 1 });
FeedbackSchema.index({ feedbackMethod: 1 });


FeedbackSchema.pre('save', function(next) {
  
  if (this.email) {
    this.email = this.email.toLowerCase().trim();
  }
  
  
  if (this.firstName) {
    this.firstName = this.firstName.trim();
  }
  if (this.lastName) {
    this.lastName = this.lastName.trim();
  }
  if (this.fullName) {
    this.fullName = this.fullName.trim();
  }
  if (this.phoneNumber) {
    this.phoneNumber = this.phoneNumber.trim();
  }
  if (this.message) {
    this.message = this.message.trim();
  }
  
  next();
});


FeedbackSchema.statics.getStats = async function() {
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
  
  const moodStats = await this.aggregate([
    { $group: { _id: '$mood', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  
  const methodStats = await this.aggregate([
    { $group: { _id: '$feedbackMethod', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  
  const urgencyStats = await this.aggregate([
    { $group: { _id: '$urgency', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  
  return {
    total,
    today: todayCount,
    statusStats,
    moodStats,
    methodStats,
    urgencyStats
  };
};


FeedbackSchema.statics.findByEmail = function(email: string) {
  return this.find({ email: email.toLowerCase().trim() });
};


FeedbackSchema.statics.findByStatus = function(status: string) {
  return this.find({ status });
};


FeedbackSchema.statics.findByDateRange = function(startDate: Date, endDate: Date) {
  return this.find({
    createdAt: {
      $gte: startDate,
      $lte: endDate
    }
  });
};

export const feedbackModel = model("feedbacks", FeedbackSchema);
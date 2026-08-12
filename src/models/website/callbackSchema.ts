// models/website/callbackSchema.ts
import { Schema, model } from "mongoose";

const CallbackSchema = new Schema(
  {
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
    workEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    organisation: {
      type: String,
      required: true,
      trim: true,
    },
    bestTimeToCall: {
      type: String,
      enum: ["morning", "afternoon", "evening", "anytime"],
      default: "anytime",
    },
    preferredContactMethod: {
      type: String,
      enum: ["phone", "email", "whatsapp"],
      default: "phone",
    },
    message: {
      type: String,
      default: null,
    },
    formName: {
      type: String,
      default: "Request a Callback",
    },
    status: {
      type: String,
      enum: ["pending", "contacted", "completed", "failed"],
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
      default: "callback-form",
    },
    contactedAt: {
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
CallbackSchema.index({ workEmail: 1 });
CallbackSchema.index({ phoneNumber: 1 });
CallbackSchema.index({ createdAt: -1 });

export const callbackModel = model("website_callbacks", CallbackSchema);
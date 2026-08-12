// models/website/investigatorGuideSchema.ts
import { Schema, model } from "mongoose";

const InvestigatorGuideSchema = new Schema(
  {
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
    organisation: {
      type: String,
      required: true,
      trim: true,
    },
    formName: {
      type: String,
      default: "Investigator Site Guide",
    },
    status: {
      type: String,
      enum: ["pending", "processed", "sent", "failed"],
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
      default: "investigator-guide-form",
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
InvestigatorGuideSchema.index({ workEmail: 1 });
InvestigatorGuideSchema.index({ createdAt: -1 });

export const investigatorGuideModel = model("investigator_guides", InvestigatorGuideSchema);
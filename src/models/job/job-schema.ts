import { Schema, model, Document } from "mongoose";

export interface IResponsibility {
  id: string;
  text: string;
}

export interface IRequirement {
  id: string;
  text: string;
}

export interface IBenefit {
  id: string;
  text: string;
}

export interface ITeamMember {
  id: string;
  name: string;
  role: string;
  initials: string;
  color: string;
  assigned: boolean;
}

export interface IJob extends Document {
  jobTitle: string;
  availability: string;
  experience: string;
  contractType: string;
  locations: string[];
  salaryMin: string;
  salaryMax: string;
  status: string;
  startDate: string | null;
  deadline: string;
  notes: string | null;
  responsibilities: IResponsibility[];
  requirements: IRequirement[];
  benefits: IBenefit[];
  teamMembers: ITeamMember[];
  autoShortlistScore: number;
  requireResume: boolean;
  requireCoverLetter: boolean;
  requireDrivingLicence: boolean;
  requireDBS: boolean;
  requireReferences: boolean;
  createdBy: string;
  publishedAt: Date | null;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const responsibilitySchema = new Schema<IResponsibility>(
  {
    id: { type: String, required: true },
    text: { type: String, required: true }
  },
  { _id: false }
);

const requirementSchema = new Schema<IRequirement>(
  {
    id: { type: String, required: true },
    text: { type: String, required: true }
  },
  { _id: false }
);

const benefitSchema = new Schema<IBenefit>(
  {
    id: { type: String, required: true },
    text: { type: String, required: true }
  },
  { _id: false }
);

const teamMemberSchema = new Schema<ITeamMember>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, required: true },
    initials: { type: String, required: true },
    color: { type: String, required: true },
    assigned: { type: Boolean, default: false }
  },
  { _id: false }
);

const jobSchema = new Schema<IJob>(
  {
    jobTitle: {
      type: String,
      required: [true, "Job title is required"],
      trim: true
    },
    availability: {
      type: String,
      required: [true, "Availability is required"],
      enum: ["Full Time", "Part Time", "Bank Hours", "Contract"]
    },
    experience: {
      type: String,
      required: [true, "Experience is required"],
      enum: ["No Experience", "1+ Years", "2+ Years", "3+ Years", "5+ Years", "10+ Years"]
    },
    contractType: {
      type: String,
      required: [true, "Contract type is required"],
      enum: ["Permanent", "Temporary", "Fixed Term", "Contract", "Freelance"]
    },
    locations: {
      type: [String],
      required: [true, "At least one location is required"],
      validate: {
        validator: function(v: string[]) {
          return v && v.length > 0;
        },
        message: "Please select at least one location"
      }
    },
    salaryMin: {
      type: String,
      required: [true, "Minimum salary is required"]
    },
    salaryMax: {
      type: String,
      required: [true, "Maximum salary is required"]
    },
    status: {
      type: String,
      required: true,
      enum: ["Draft", "Open", "Paused", "Closed", "Archived"],
      default: "Draft"
    },
    startDate: {
      type: String,
      default: null
    },
    deadline: {
      type: String,
      required: [true, "Application deadline is required"]
    },
    notes: {
      type: String,
      default: null
    },
    responsibilities: {
      type: [responsibilitySchema],
      default: []
    },
    requirements: {
      type: [requirementSchema],
      default: []
    },
    benefits: {
      type: [benefitSchema],
      default: []
    },
    teamMembers: {
      type: [teamMemberSchema],
      default: []
    },
    autoShortlistScore: {
      type: Number,
      default: 75,
      min: 0,
      max: 100
    },
    requireResume: {
      type: Boolean,
      default: true
    },
    requireCoverLetter: {
      type: Boolean,
      default: false
    },
    requireDrivingLicence: {
      type: Boolean,
      default: false
    },
    requireDBS: {
      type: Boolean,
      default: true
    },
    requireReferences: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: String,
      required: true
    },
    publishedAt: {
      type: Date,
      default: null
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes
jobSchema.index({ jobTitle: "text", notes: "text" });
jobSchema.index({ status: 1, createdAt: -1 });
jobSchema.index({ locations: 1 });
jobSchema.index({ availability: 1, contractType: 1 });
jobSchema.index({ isDeleted: 1 });

// Pre-save middleware
jobSchema.pre<IJob>("save", function(next) {
  if (this.isModified("status") && (this.status === "Open" || this.status === "Published")) {
    this.publishedAt = new Date();
  }
  next();
});

export const jobModel = model<IJob>("jobs", jobSchema);
// models/application-schema.ts
import { Schema, model, Document } from "mongoose";

export interface IApplication extends Document {
  // References
  candidateId: string;
  jobId: string;
  jobTitle: string;
  
  // Application Details
  coverLetter: string;
  additionalNotes: string;
  availableFrom: string;
  expectedSalary: string;
  noticePeriod: string;
  
  // Status & Tracking
  status: 'Pending' | 'In Review' | 'Interview Scheduled' | 'Offer Sent' | 'Hired' | 'Rejected';
  score: number;
  applicationDate: Date;
  
  // Interview Details
  interviewDate?: Date;
  interviewNotes?: string;
  interviewers?: string[];
  
  // Offer Details
  offerDetails?: {
    salary: string;
    startDate: string;
    benefits: string;
    offerLetter: string;
  };
  
  // Rejection Details
  rejectionReason?: string;
  rejectionNotes?: string;
  
  // Metadata
  createdBy: string;
  updatedBy: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Job Details Snapshot (store job details at time of application)
  jobSnapshot: {
    title: string;
    location: string;
    contractType: string;
    salaryMin: string;
    salaryMax: string;
    experience: string;
    availability: string;
    requireResume: boolean;
    requireCoverLetter: boolean;
    requireDrivingLicence: boolean;
    requireDBS: boolean;
    requireReferences: boolean;
  };
}

const applicationSchema = new Schema<IApplication>(
  {
    candidateId: {
      type: String,
      required: [true, "Candidate ID is required"],
      ref: 'candidates'
    },
    jobId: {
      type: String,
      required: [true, "Job ID is required"]
    },
    jobTitle: {
      type: String,
      required: [true, "Job Title is required"],
      trim: true
    },
    
    // Application Details
    coverLetter: {
      type: String,
      default: ''
    },
    additionalNotes: {
      type: String,
      default: ''
    },
    availableFrom: {
      type: String,
      default: ''
    },
    expectedSalary: {
      type: String,
      default: ''
    },
    noticePeriod: {
      type: String,
      default: ''
    },
    
    // Status & Tracking
    status: {
      type: String,
      enum: ['Pending', 'In Review', 'Interview Scheduled', 'Offer Sent', 'Hired', 'Rejected'],
      default: 'Pending'
    },
    score: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    applicationDate: {
      type: Date,
      default: Date.now
    },
    
    // Interview Details
    interviewDate: {
      type: Date,
      default: null
    },
    interviewNotes: {
      type: String,
      default: ''
    },
    interviewers: {
      type: [String],
      default: []
    },
    
    // Offer Details
    offerDetails: {
      salary: { type: String, default: '' },
      startDate: { type: String, default: '' },
      benefits: { type: String, default: '' },
      offerLetter: { type: String, default: '' }
    },
    
    // Rejection Details
    rejectionReason: {
      type: String,
      default: ''
    },
    rejectionNotes: {
      type: String,
      default: ''
    },
    
    // Job Snapshot
    jobSnapshot: {
      title: { type: String, default: '' },
      location: { type: String, default: '' },
      contractType: { type: String, default: '' },
      salaryMin: { type: String, default: '' },
      salaryMax: { type: String, default: '' },
      experience: { type: String, default: '' },
      availability: { type: String, default: '' },
      requireResume: { type: Boolean, default: false },
      requireCoverLetter: { type: Boolean, default: false },
      requireDrivingLicence: { type: Boolean, default: false },
      requireDBS: { type: Boolean, default: false },
      requireReferences: { type: Boolean, default: false }
    },
    
    // Metadata
    createdBy: {
      type: String,
      default: ''
    },
    updatedBy: {
      type: String,
      default: ''
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
applicationSchema.index({ candidateId: 1, jobId: 1 }, { unique: true });
applicationSchema.index({ jobId: 1 });
applicationSchema.index({ status: 1 });
applicationSchema.index({ applicationDate: -1 });
applicationSchema.index({ isDeleted: 1 });

export const applicationModel = model<IApplication>("applications", applicationSchema);
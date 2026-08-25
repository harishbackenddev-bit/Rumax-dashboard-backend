// models/application-schema.ts
import { Schema, model, Document } from "mongoose";

// Status history entry
export interface IStatusHistory {
  status: string;
  changedAt: Date;
  changedBy?: string;
  changedByName?: string;
  changedByRole?: string;
  notes?: string;
  reason?: string;
  fromStatus?: string;
  toStatus?: string;
}

// Interview details
export interface IInterviewDetails {
  date: Date;
  time: string;
  interviewer: string;
  interviewers?: string[];
  format: 'Video Call (Teams)' | 'In-Person' | 'Phone Call';
  notes: string;
  scheduledBy: string;
  scheduledByName: string;
  scheduledAt: Date;
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'Rescheduled';
  rescheduledCount: number;
  feedback?: string;
  rating?: number;
}

// Offer details
export interface IOfferDetails {
  salary: string;
  startDate: string;
  benefits: string;
  offerLetter: string;
  offeredBy: string;
  offeredByName: string;
  offeredAt: Date;
  offerExpiryDate: Date;
  offerAccepted: boolean;
  offerAcceptedDate: Date;
  offerDeclined: boolean;
  offerDeclinedDate: Date;
  offerDeclinedReason: string;
  counterOffer?: string;
  negotiationNotes?: string;
}

// Document request
export interface IDocumentRequest {
  documents: string[];
  note: string;
  requestedDate: Date;
  requestedBy: string;
  requestedByName: string;
  status: 'Pending' | 'Received' | 'Partial';
  receivedDate?: Date;
  receivedBy?: string;
  receivedByName?: string;
  responseNote?: string;
}

export interface IApplication extends Document {
  // ============================================
  // REFERENCES
  // ============================================
  candidateId: string;
  jobId: string;
  jobTitle: string;
  
  // ============================================
  // APPLICATION DETAILS
  // ============================================
  coverLetter: string;
  additionalNotes: string;
  availableFrom: string;
  expectedSalary: string;
  noticePeriod: string;
  
  // ============================================
  // STATUS & TRACKING (MOVED FROM CANDIDATE)
  // ============================================
  status: 'Pending' | 'Active' | 'In Review' | 'Interview Scheduled' | 'Offer Sent' | 'Hired' | 'Rejected' | 'Standby' | 'Document Requested';
  statusHistory: IStatusHistory[];
  currentStatus: {
    status: string;
    updatedBy: string;
    updatedByName: string;
    updatedByRole: string;
    updatedAt: Date;
    notes: string;
  };
  lastStatusChange: Date;
  statusChangeCount: number;
  statusNotes: string;
  internalNotes: string;
  statusTimeline: {
    pendingAt?: Date;
    activeAt?: Date;
    inReviewAt?: Date;
    interviewScheduledAt?: Date;
    offerSentAt?: Date;
    hiredAt?: Date;
    rejectedAt?: Date;
    standbyAt?: Date;
    documentRequestedAt?: Date;
  };
  
  // ============================================
  // SCORE & APPLICATION DATE
  // ============================================
  score: number;
  applicationDate: Date;
  applicationSource: string;
  
  // ============================================
  // REJECTION DETAILS (MOVED FROM CANDIDATE)
  // ============================================
  rejectionReason: string;
  rejectionNotes: string;
  rejectedBy: string;
  rejectedByName: string;
  rejectedAt: Date;
  
  // ============================================
  // INTERVIEW DETAILS (MOVED FROM CANDIDATE)
  // ============================================
  interviewDetails: IInterviewDetails;
  interviewDate: Date;
  interviewTime: string;
  interviewer: string;
  interviewers: string[];
  interviewFormat: string;
  interviewNotes: string;
  interviewScheduledBy: string;
  interviewScheduledByName: string;
  interviewScheduledAt: Date;
  
  // ============================================
  // OFFER & HIRING (MOVED FROM CANDIDATE)
  // ============================================
  offerDetails: IOfferDetails;
  offerSentAt: Date;
  hiredAt: Date;
  
  // ============================================
  // STANDBY DETAILS (MOVED FROM CANDIDATE)
  // ============================================
  standbyReason: string;
  standbyDate: Date;
  standbyBy: string;
  standbyByName: string;
  
  // ============================================
  // DOCUMENT REQUESTS (MOVED FROM CANDIDATE)
  // ============================================
  documentRequests: IDocumentRequest[];
  requestedDocuments: string[];
  documentRequestNote: string;
  documentRequestedAt: Date;
  
  // ============================================
  // CANDIDATE SNAPSHOT (Store candidate data at application time)
  // ============================================
  candidateSnapshot: {
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    county: string;
    postcode: string;
    nationality: string;
    rightToWork: string;
    photoUrl: string;
    
    // Role & Availability
    positionAppliedFor: string;
    workPreference: string;
    preferredLocations: string[];
    availabilitySchedule: {
      monday: string[];
      tuesday: string[];
      wednesday: string[];
      thursday: string[];
      friday: string[];
      saturday: string[];
      sunday: string[];
    };
    drivingLicense: boolean;
    ownVehicle: boolean;
    shiftConfirmation: boolean;
    
    // Qualifications
    education: Array<{
      id: string;
      institution: string;
      qualification: string;
      startDate: string;
      endDate: string;
      grade: string;
    }>;
    experience: Array<{
      id: string;
      employer: string;
      position: string;
      startDate: string;
      endDate: string;
      current: boolean;
      responsibilities: string;
    }>;
    training: Array<{
      id: string;
      name: string;
      provider: string;
      dateCompleted: string;
      expiryDate: string;
      certificate: string;
    }>;
    registrations: Array<{
      id: string;
      body: string;
      number: string;
      expiryDate: string;
    }>;
    
    // Compliance
    references: Array<{
      id: string;
      fullName: string;
      company: string;
      jobTitle: string;
      phone: string;
      email: string;
      relationship: string;
      yearsKnown: string;
      type: string;
    }>;
    dbsValid: boolean;
    disciplinaryAction: boolean;
    unspentConvictions: boolean;
    
    // Documents
    documents: string[];
    drivingLicenceUrl: string;
    dbsCertificateUrl: string;
    referencesUrl: string;
    
    // Values & Assessment
    heardFrom: string;
    supportingStatement: string;
    scenarioAnswers: {
      q1: string;
      q2: string;
      q3: string;
    };
    coreValues: string[];
    
    // Resume & Cover Letter
    resumeUrl: string;
    coverLetterUrl: string;
    coverLetter: string;
  };
  
  // ============================================
  // JOB SNAPSHOT (Store job details at application time)
  // ============================================
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
  
  // ============================================
  // METADATA
  // ============================================
  createdBy: string;
  createdByName: string;
  updatedBy: string;
  updatedByName: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// SUB-SCHEMAS
// ============================================

// Status History Schema
const statusHistorySchema = new Schema<IStatusHistory>({
  status: { type: String, required: true },
  changedAt: { type: Date, default: Date.now },
  changedBy: { type: String, default: '' },
  changedByName: { type: String, default: '' },
  changedByRole: { type: String, default: '' },
  notes: { type: String, default: '' },
  reason: { type: String, default: '' },
  fromStatus: { type: String, default: '' },
  toStatus: { type: String, default: '' }
});

// Interview Details Schema
const interviewDetailsSchema = new Schema<IInterviewDetails>({
  date: { type: Date, default: null },
  time: { type: String, default: '' },
  interviewer: { type: String, default: '' },
  interviewers: { type: [String], default: [] },
  format: { 
    type: String, 
    enum: ['Video Call (Teams)', 'In-Person', 'Phone Call'],
    default: 'Video Call (Teams)'
  },
  notes: { type: String, default: '' },
  scheduledBy: { type: String, default: '' },
  scheduledByName: { type: String, default: '' },
  scheduledAt: { type: Date, default: null },
  status: { 
    type: String, 
    enum: ['Scheduled', 'Completed', 'Cancelled', 'Rescheduled'],
    default: 'Scheduled'
  },
  rescheduledCount: { type: Number, default: 0 },
  feedback: { type: String, default: '' },
  rating: { type: Number, default: 0 }
});

// Offer Details Schema
const offerDetailsSchema = new Schema<IOfferDetails>({
  salary: { type: String, default: '' },
  startDate: { type: String, default: '' },
  benefits: { type: String, default: '' },
  offerLetter: { type: String, default: '' },
  offeredBy: { type: String, default: '' },
  offeredByName: { type: String, default: '' },
  offeredAt: { type: Date, default: null },
  offerExpiryDate: { type: Date, default: null },
  offerAccepted: { type: Boolean, default: false },
  offerAcceptedDate: { type: Date, default: null },
  offerDeclined: { type: Boolean, default: false },
  offerDeclinedDate: { type: Date, default: null },
  offerDeclinedReason: { type: String, default: '' },
  counterOffer: { type: String, default: '' },
  negotiationNotes: { type: String, default: '' }
});

// Document Request Schema
const documentRequestSchema = new Schema<IDocumentRequest>({
  documents: { type: [String], default: [] },
  note: { type: String, default: '' },
  requestedDate: { type: Date, default: Date.now },
  requestedBy: { type: String, default: '' },
  requestedByName: { type: String, default: '' },
  status: { 
    type: String, 
    enum: ['Pending', 'Received', 'Partial'],
    default: 'Pending'
  },
  receivedDate: { type: Date, default: null },
  receivedBy: { type: String, default: '' },
  receivedByName: { type: String, default: '' },
  responseNote: { type: String, default: '' }
});

// ============================================
// MAIN APPLICATION SCHEMA
// ============================================
const applicationSchema = new Schema<IApplication>(
  {
    // ============================================
    // REFERENCES
    // ============================================
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
    
    // ============================================
    // APPLICATION DETAILS
    // ============================================
    coverLetter: { type: String, default: '' },
    additionalNotes: { type: String, default: '' },
    availableFrom: { type: String, default: '' },
    expectedSalary: { type: String, default: '' },
    noticePeriod: { type: String, default: '' },
    
    // ============================================
    // STATUS & TRACKING (MOVED FROM CANDIDATE)
    // ============================================
    status: {
      type: String,
      enum: ['Pending', 'Active', 'In Review', 'Interview Scheduled', 'Offer Sent', 'Hired', 'Rejected', 'Standby', 'Document Requested'],
      default: 'Pending'
    },
    statusHistory: [statusHistorySchema],
    currentStatus: {
      status: { type: String, default: '' },
      updatedBy: { type: String, default: '' },
      updatedByName: { type: String, default: '' },
      updatedByRole: { type: String, default: '' },
      updatedAt: { type: Date, default: Date.now },
      notes: { type: String, default: '' }
    },
    lastStatusChange: { type: Date, default: Date.now },
    statusChangeCount: { type: Number, default: 0 },
    statusNotes: { type: String, default: '' },
    internalNotes: { type: String, default: '' },
    statusTimeline: {
      pendingAt: { type: Date, default: null },
      activeAt: { type: Date, default: null },
      inReviewAt: { type: Date, default: null },
      interviewScheduledAt: { type: Date, default: null },
      offerSentAt: { type: Date, default: null },
      hiredAt: { type: Date, default: null },
      rejectedAt: { type: Date, default: null },
      standbyAt: { type: Date, default: null },
      documentRequestedAt: { type: Date, default: null }
    },
    
    // ============================================
    // SCORE & APPLICATION DATE
    // ============================================
    score: { type: Number, default: 0, min: 0, max: 100 },
    applicationDate: { type: Date, default: Date.now },
    applicationSource: { type: String, default: 'Website' },
    
    // ============================================
    // REJECTION DETAILS (MOVED FROM CANDIDATE)
    // ============================================
    rejectionReason: { type: String, default: '' },
    rejectionNotes: { type: String, default: '' },
    rejectedBy: { type: String, default: '' },
    rejectedByName: { type: String, default: '' },
    rejectedAt: { type: Date, default: null },
    
    // ============================================
    // INTERVIEW DETAILS (MOVED FROM CANDIDATE)
    // ============================================
    interviewDetails: { type: interviewDetailsSchema, default: null },
    interviewDate: { type: Date, default: null },
    interviewTime: { type: String, default: '' },
    interviewer: { type: String, default: '' },
    interviewers: { type: [String], default: [] },
    interviewFormat: { 
      type: String, 
      enum: ['Video Call (Teams)', 'In-Person', 'Phone Call'],
      default: 'Video Call (Teams)'
    },
    interviewNotes: { type: String, default: '' },
    interviewScheduledBy: { type: String, default: '' },
    interviewScheduledByName: { type: String, default: '' },
    interviewScheduledAt: { type: Date, default: null },
    
    // ============================================
    // OFFER & HIRING (MOVED FROM CANDIDATE)
    // ============================================
    offerDetails: { type: offerDetailsSchema, default: null },
    offerSentAt: { type: Date, default: null },
    hiredAt: { type: Date, default: null },
    
    // ============================================
    // STANDBY DETAILS (MOVED FROM CANDIDATE)
    // ============================================
    standbyReason: { type: String, default: '' },
    standbyDate: { type: Date, default: null },
    standbyBy: { type: String, default: '' },
    standbyByName: { type: String, default: '' },
    
    // ============================================
    // DOCUMENT REQUESTS (MOVED FROM CANDIDATE)
    // ============================================
    documentRequests: [documentRequestSchema],
    requestedDocuments: { type: [String], default: [] },
    documentRequestNote: { type: String, default: '' },
    documentRequestedAt: { type: Date, default: null },
    
    // ============================================
    // CANDIDATE SNAPSHOT
    // ============================================
    candidateSnapshot: {
      firstName: { type: String, default: '' },
      lastName: { type: String, default: '' },
      fullName: { type: String, default: '' },
      email: { type: String, default: '' },
      phone: { type: String, default: '' },
      dateOfBirth: { type: String, default: '' },
      addressLine1: { type: String, default: '' },
      addressLine2: { type: String, default: '' },
      city: { type: String, default: '' },
      county: { type: String, default: '' },
      postcode: { type: String, default: '' },
      nationality: { type: String, default: '' },
      rightToWork: { type: String, default: '' },
      photoUrl: { type: String, default: '' },
      
      // Role & Availability
      positionAppliedFor: { type: String, default: '' },
      workPreference: { 
        type: String, 
        enum: ['Full Time', 'Part Time', 'Bank Hours', 'Contract'],
        default: 'Full Time'
      },
      preferredLocations: { type: [String], default: [] },
      availabilitySchedule: {
        monday: { type: [String], default: [] },
        tuesday: { type: [String], default: [] },
        wednesday: { type: [String], default: [] },
        thursday: { type: [String], default: [] },
        friday: { type: [String], default: [] },
        saturday: { type: [String], default: [] },
        sunday: { type: [String], default: [] }
      },
      drivingLicense: { type: Boolean, default: false },
      ownVehicle: { type: Boolean, default: false },
      shiftConfirmation: { type: Boolean, default: false },
      
      // Qualifications
      education: [{
        id: { type: String, default: '' },
        institution: { type: String, default: '' },
        qualification: { type: String, default: '' },
        startDate: { type: String, default: '' },
        endDate: { type: String, default: '' },
        grade: { type: String, default: '' }
      }],
      experience: [{
        id: { type: String, default: '' },
        employer: { type: String, default: '' },
        position: { type: String, default: '' },
        startDate: { type: String, default: '' },
        endDate: { type: String, default: '' },
        current: { type: Boolean, default: false },
        responsibilities: { type: String, default: '' }
      }],
      training: [{
        id: { type: String, default: '' },
        name: { type: String, default: '' },
        provider: { type: String, default: '' },
        dateCompleted: { type: String, default: '' },
        expiryDate: { type: String, default: '' },
        certificate: { type: String, default: '' }
      }],
      registrations: [{
        id: { type: String, default: '' },
        body: { type: String, default: '' },
        number: { type: String, default: '' },
        expiryDate: { type: String, default: '' }
      }],
      
      // Compliance
      references: [{
        id: { type: String, default: '' },
        fullName: { type: String, default: '' },
        company: { type: String, default: '' },
        jobTitle: { type: String, default: '' },
        phone: { type: String, default: '' },
        email: { type: String, default: '' },
        relationship: { type: String, default: '' },
        yearsKnown: { type: String, default: '' },
        type: { type: String, default: 'Professional' }
      }],
      dbsValid: { type: Boolean, default: false },
      disciplinaryAction: { type: Boolean, default: false },
      unspentConvictions: { type: Boolean, default: false },
      
      // Documents
      documents: { type: [String], default: [] },
      drivingLicenceUrl: { type: String, default: '' },
      dbsCertificateUrl: { type: String, default: '' },
      referencesUrl: { type: String, default: '' },
      
      // Values & Assessment
      heardFrom: { 
        type: String, 
        enum: ['Indeed', 'Total Jobs', 'Internal Referral', 'Company Website', 'Other'],
        default: 'Other'
      },
      supportingStatement: { type: String, default: '' },
      scenarioAnswers: {
        q1: { type: String, default: '' },
        q2: { type: String, default: '' },
        q3: { type: String, default: '' }
      },
      coreValues: { type: [String], default: ['Compassion', 'Respect', 'Integrity', 'Continuous Learning', 'Excellence'] },
      
      // Resume & Cover Letter
      resumeUrl: { type: String, default: '' },
      coverLetterUrl: { type: String, default: '' },
      coverLetter: { type: String, default: '' }
    },
    
    // ============================================
    // JOB SNAPSHOT
    // ============================================
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
    
    // ============================================
    // METADATA
    // ============================================
    createdBy: { type: String, default: '' },
    createdByName: { type: String, default: '' },
    updatedBy: { type: String, default: '' },
    updatedByName: { type: String, default: '' },
    isDeleted: { type: Boolean, default: false }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// ============================================
// INDEXES
// ============================================
applicationSchema.index({ candidateId: 1, jobId: 1 });
applicationSchema.index({ candidateId: 1 });
applicationSchema.index({ jobId: 1 });
applicationSchema.index({ status: 1 });
applicationSchema.index({ applicationDate: -1 });
applicationSchema.index({ isDeleted: 1 });
applicationSchema.index({ lastStatusChange: -1 });
applicationSchema.index({ 'statusHistory.timestamp': -1 });

// ============================================
// MIDDLEWARE
// ============================================
applicationSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate() as any;
  if (update.status) {
    update.lastStatusChange = new Date();
    update.statusChangeCount = { $inc: 1 };
    update.currentStatus = {
      status: update.status,
      updatedBy: update.updatedBy || '',
      updatedByName: update.updatedByName || '',
      updatedByRole: update.updatedByRole || '',
      updatedAt: new Date(),
      notes: update.statusNotes || ''
    };
    
    if (!update.$push) {
      update.$push = {};
    }
    update.$push.statusHistory = {
      status: update.status,
      changedBy: update.updatedBy || '',
      changedByName: update.updatedByName || '',
      changedByRole: update.updatedByRole || '',
      notes: update.statusNotes || '',
      timestamp: new Date(),
      toStatus: update.status
    };
    
    const timelineField = `${update.status.toLowerCase()}At`;
    if (update.statusTimeline) {
      update.statusTimeline[timelineField] = new Date();
    } else {
      update.statusTimeline = {
        [timelineField]: new Date()
      };
    }
  }
  next();
});

export const applicationModel = model<IApplication>("applications", applicationSchema);
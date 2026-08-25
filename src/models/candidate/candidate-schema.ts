// models/candidate-schema.ts
import { Schema, model, Document } from "mongoose";

// Education sub-document
export interface IEducation {
  id: string;
  institution: string;
  qualification: string;
  startDate: string;
  endDate: string;
  grade: string;
}

// Experience sub-document
export interface IExperience {
  id: string;
  employer: string;
  position: string;
  startDate: string;
  endDate: string;
  current: boolean;
  responsibilities: string;
}

// Training sub-document
export interface ITraining {
  id: string;
  name: string;
  provider: string;
  dateCompleted: string;
  expiryDate: string;
  certificate: string;
}

// Registration sub-document
export interface IRegistration {
  id: string;
  body: string;
  number: string;
  expiryDate: string;
}

// Reference sub-document
export interface IReference {
  id: string;
  fullName: string;
  company: string;
  jobTitle: string;
  phone: string;
  email: string;
  relationship: string;
  yearsKnown: string;
  type: 'Professional' | 'Manager' | 'Character Reference';
}

// Availability schedule
export interface IAvailabilitySchedule {
  monday: string[];
  tuesday: string[];
  wednesday: string[];
  thursday: string[];
  friday: string[];
  saturday: string[];
  sunday: string[];
}

// Scenario answers
export interface IScenarioAnswers {
  q1: string;
  q2: string;
  q3: string;
}

// Status history entry
export interface IStatusHistory {
  status: string;
  jobId?: string;
  jobTitle?: string;
  changedAt: Date;
  changedBy?: string;
  notes?: string;
  reason?: string;
}

export interface ICandidate extends Document {
  // Step 1: Personal Information
  firstName: string;
  lastName: string;
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
  
  // Step 2: Role & Availability (Preferences)
  positionAppliedFor: string;
  workPreference: 'Full Time' | 'Part Time' | 'Bank Hours' | 'Contract';
  preferredLocations: string[];
  availabilitySchedule: IAvailabilitySchedule;
  drivingLicense: boolean;
  ownVehicle: boolean;
  shiftConfirmation: boolean;
  
  // Step 3: Qualifications & Experience
  education: IEducation[];
  experience: IExperience[];
  training: ITraining[];
  registrations: IRegistration[];
  
  // Step 4: Compliance & References
  references: IReference[];
  dbsValid: boolean;
  disciplinaryAction: boolean;
  unspentConvictions: boolean;
  documents: string[];
  drivingLicenceUrl: string;
  dbsCertificateUrl: string;
  referencesUrl: string;
  
  // Step 5: Values & Assessment
  heardFrom: string;
  supportingStatement: string;
  scenarioAnswers: IScenarioAnswers;
  coreValues: string[];
  
  // Metadata
  resumeUrl: string;
  coverLetterUrl: string;
  coverLetter: string;
  notes: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Computed fields
  fullName: string;
  initials: string;
  color: string;
}

// Education Schema
const educationSchema = new Schema<IEducation>({
  id: { type: String, required: true },
  institution: { type: String, required: true },
  qualification: { type: String, required: true },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  grade: { type: String, default: '' }
});

// Experience Schema
const experienceSchema = new Schema<IExperience>({
  id: { type: String, required: true },
  employer: { type: String, required: true },
  position: { type: String, required: true },
  startDate: { type: String, required: true },
  endDate: { type: String, default: '' },
  current: { type: Boolean, default: false },
  responsibilities: { type: String, default: '' }
});

// Training Schema
const trainingSchema = new Schema<ITraining>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  provider: { type: String, required: true },
  dateCompleted: { type: String, required: true },
  expiryDate: { type: String, required: true },
  certificate: { type: String, default: '' }
});

// Registration Schema
const registrationSchema = new Schema<IRegistration>({
  id: { type: String, required: true },
  body: { type: String, required: true },
  number: { type: String, required: true },
  expiryDate: { type: String, required: true }
});

// Reference Schema
const referenceSchema = new Schema<IReference>({
  id: { type: String, required: true },
  fullName: { type: String, required: true },
  company: { type: String, required: true },
  jobTitle: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  relationship: { type: String, required: true },
  yearsKnown: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['Professional', 'Manager', 'Character Reference'],
    required: true 
  }
});

// Availability Schedule Schema
const availabilityScheduleSchema = new Schema<IAvailabilitySchedule>({
  monday: { type: [String], default: [] },
  tuesday: { type: [String], default: [] },
  wednesday: { type: [String], default: [] },
  thursday: { type: [String], default: [] },
  friday: { type: [String], default: [] },
  saturday: { type: [String], default: [] },
  sunday: { type: [String], default: [] }
});

// Scenario Answers Schema
const scenarioAnswersSchema = new Schema<IScenarioAnswers>({
  q1: { type: String, required: true },
  q2: { type: String, required: true },
  q3: { type: String, required: true }
});

// Status History Schema
const statusHistorySchema = new Schema<IStatusHistory>({
  status: { type: String, required: true },
  jobId: { type: String, default: '' },
  jobTitle: { type: String, default: '' },
  changedAt: { type: Date, default: Date.now },
  changedBy: { type: String, default: '' },
  notes: { type: String, default: '' },
  reason: { type: String, default: '' }
});

// Main Candidate Schema
const candidateSchema = new Schema<ICandidate>(
  {
    // Step 1: Personal Information
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    dateOfBirth: { type: String, required: true },
    addressLine1: { type: String, required: true, trim: true },
    addressLine2: { type: String, default: '', trim: true },
    city: { type: String, required: true, trim: true },
    county: { type: String, required: true, trim: true },
    postcode: { type: String, required: true, trim: true },
    nationality: { type: String, required: true, trim: true },
     photoUrl: { 
            type: String, 
            default: null,
            description: "URL to candidate profile photo stored in public/upload/profile"
        },
    rightToWork: { 
      type: String, 
      required: true,
      enum: ['British Citizen', 'Indefinite Leave', 'Skilled Worker Visa', 'Student Visa', 'Other']
    },

    // Step 2: Role & Availability
    positionAppliedFor: { type: String, required: true, trim: true },
    workPreference: { 
      type: String, 
      required: true,
      enum: ['Full Time', 'Part Time', 'Bank Hours', 'Contract']
    },
    preferredLocations: { type: [String], required: true, default: [] },
    availabilitySchedule: { type: availabilityScheduleSchema, required: true, default: () => ({}) },
    drivingLicense: { type: Boolean, default: false },
    ownVehicle: { type: Boolean, default: false },
    shiftConfirmation: { type: Boolean, default: false },

    // Step 3: Qualifications & Experience
    education: { type: [educationSchema], default: [] },
    experience: { type: [experienceSchema], default: [] },
    training: { type: [trainingSchema], default: [] },
    registrations: { type: [registrationSchema], default: [] },

    // Step 4: Compliance & References
    references: { type: [referenceSchema], default: [] },
    dbsValid: { type: Boolean, required: true },
    disciplinaryAction: { type: Boolean, required: true },
    unspentConvictions: { type: Boolean, required: true },
    documents: { type: [String], default: [] },
    drivingLicenceUrl: { type: String, default: '' },
    dbsCertificateUrl: { type: String, default: '' },
    referencesUrl: { type: String, default: '' },

    // Step 5: Values & Assessment
    heardFrom: { 
      type: String, 
      required: true,
      enum: ['Indeed', 'Total Jobs', 'Internal Referral', 'Company Website', 'Other']
    },
    supportingStatement: { type: String, required: true },
    scenarioAnswers: { type: scenarioAnswersSchema, required: true },
    coreValues: { type: [String], default: ['Compassion', 'Respect', 'Integrity', 'Continuous Learning', 'Excellence'] },

    // ============================================
    // STATUS & APPLICATION TRACKING
    // ============================================
    status: { 
      type: String, 
      required: true,
      default: 'Pending'
    },
    statusHistory: { type: [statusHistorySchema], default: [] },
    appliedDate: { type: Date, default: Date.now },
    applicationSource: { type: String, default: 'Website' },
    
    // Rejection details
    rejectionReason: { type: String, default: '' },
    rejectionNotes: { type: String, default: '' },
    rejectedAt: { type: Date, default: null },
    
    // Interview details
    interviewDate: { type: String, default: '' },
    interviewTime: { type: String, default: '' },
    interviewer: { type: String, default: '' },
    interviewFormat: { type: String, default: 'Video Call (Teams)' },
    interviewScheduledAt: { type: Date, default: null },
    
    // Offer & Hiring
    offerSentAt: { type: Date, default: null },
    hiredAt: { type: Date, default: null },
    
    // Current job context
    currentJobId: { type: String, default: '' },
    currentJobTitle: { type: String, default: '' },

    // ============================================
    // DOCUMENT REQUEST FIELDS
    // ============================================
    requestedDocuments: { type: [String], default: [] },
    documentRequestNote: { type: String, default: '' },
    documentRequestedAt: { type: Date, default: null },

    // Metadata
    resumeUrl: { type: String, default: '' },
    coverLetterUrl: { type: String, default: '' },
    coverLetter: { type: String, default: '' },
    notes: { type: String, default: '' },
    score: { type: Number, default: 0, min: 0, max: 100 },
    isDeleted: { type: Boolean, default: false }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtuals
candidateSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`.trim();
});

candidateSchema.virtual('fullAddress').get(function() {
  const parts = [this.addressLine1];
  if (this.addressLine2) parts.push(this.addressLine2);
  parts.push(this.city);
  parts.push(this.county);
  parts.push(this.postcode);
  return parts.join(', ');
});

// Pre-save hook - Update status history
candidateSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    this.statusHistory.push({
      status: this.status,
      jobId: this.currentJobId || '',
      jobTitle: this.currentJobTitle || '',
      changedAt: new Date(),
      notes: `Status changed to ${this.status}`
    });
  }
  next();
});

// Indexes
candidateSchema.index({ email: 1 });
candidateSchema.index({ isDeleted: 1 });
candidateSchema.index({ status: 1 });
candidateSchema.index({ appliedDate: -1 });
candidateSchema.index({ firstName: 'text', lastName: 'text', email: 'text' });

export const candidateModel = model<ICandidate>("candidates", candidateSchema);

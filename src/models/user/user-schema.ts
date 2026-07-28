import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  identifier?: string;
  role: string;
  name: string;
  email: string;
  password: string;
  phoneNumber?: string | null;
  profilePic?: string | null;
  address?: string | null;
  department_type?: string | null;
  organisation?: string | null;
  profileType?: string | null;
  isActive: boolean;
  twoFactorAuth: boolean;
  emailVerified: boolean;
  isTeamMember: boolean;
  initials?: string | null;
  color?: string | null;
  permissions: string[];
  lastLogin?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

const usersSchema = new Schema<IUser>(
  {
    identifier: {
      type: String,
      unique: true,
      sparse: true,
    },

    role: {
      type: String,
      required: true,
      default: "user",
      enum: ["user", "admin", "recruiter", "hr_manager", "hiring_manager", "super_admin"],
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    phoneNumber: {
      type: String,
      default: null,
      trim: true,
    },

    profilePic: {
      type: String,
      default: null,
    },

    address: {
      type: String,
      default: null,
    },

    department_type: {
      type: String,
      default: null,
      enum: ["hr", "recruitment", "technology", "product", "operations", "finance", "marketing", "sales", "it", "other"],
    },

    organisation: {
      type: String,
      default: null,
      trim: true,
    },

    profileType: {
      type: String,
      default: null,
      enum: ["job_seeker", "employer", "agency", "consultant", "team_member"],
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    twoFactorAuth: {
      type: Boolean,
      default: false,
    },

    emailVerified: {
      type: Boolean,
      default: true, // Changed to true by default
    },

    isTeamMember: {
      type: Boolean,
      default: false,
    },

    initials: {
      type: String,
      default: null,
    },

    color: {
      type: String,
      default: "#0F4C81",
    },

    permissions: {
      type: [String],
      default: [],
    },

    lastLogin: {
      type: Date,
      default: null,
    },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtuals - Only Active and Inactive
usersSchema.virtual('status').get(function() {
  if (!this.isActive) return 'Inactive';
  return 'Active';
});

usersSchema.virtual('roleDisplay').get(function() {
  const roleMap: Record<string, string> = {
    'admin': 'Administrator',
    'recruiter': 'Recruiter',
    'hr_manager': 'HR Manager',
    'hiring_manager': 'Hiring Manager',
    'super_admin': 'Super Admin',
    'user': 'User'
  };
  return roleMap[this.role] || this.role;
});

// Static methods
usersSchema.static('getInitials', function(name: string): string {
  if (!name) return '??';
  const nameParts = name.trim().split(' ');
  if (nameParts.length === 1) return nameParts[0].substring(0, 2).toUpperCase();
  return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
});

usersSchema.static('getColor', function(name: string): string {
  const colors = ['#0F4C81', '#27B3C9', '#7C3AED', '#059669', '#D97706', '#DC2626', '#2563EB', '#0891B2'];
  if (!name) return colors[0];
  const index = (name.length || 0) % colors.length;
  return colors[index];
});

// Instance methods
usersSchema.method('getUserInitials', function(this: IUser): string {
  if (this.initials) return this.initials;
  return (this.constructor as any).getInitials(this.name);
});

usersSchema.method('getUserColor', function(this: IUser): string {
  if (this.color) return this.color;
  return (this.constructor as any).getColor(this.name);
});

// Pre-save middleware
usersSchema.pre<IUser>('save', function(next) {
  if (this.isModified('name')) {
    if (!this.initials) {
      this.initials = (this.constructor as any).getInitials(this.name);
    }
    if (!this.color) {
      this.color = (this.constructor as any).getColor(this.name);
    }
  }
  next();
});

// Indexes
usersSchema.index({ email: 1 });
usersSchema.index({ role: 1 });
usersSchema.index({ isTeamMember: 1 });
usersSchema.index({ isActive: 1 });
usersSchema.index({ department_type: 1 });
usersSchema.index({ name: 'text' });

export const usersModel = model<IUser>("users", usersSchema);
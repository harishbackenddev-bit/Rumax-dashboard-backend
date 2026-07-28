import { Schema, model, Document } from "mongoose";

export interface IPermission {
  module: string;
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
  export: boolean;
}

export interface IRole extends Document {
  name: string;
  description: string | null;
  color: string;
  isActive: boolean;
  isDefault: boolean;
  permissions: IPermission[];
  userCount: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const permissionSchema = new Schema<IPermission>(
  {
    module: {
      type: String,
      required: true,
      enum: [
        "dashboard",
        "recruitment_pipeline",
        "jobs_vacancies",
        "employees",
        "reports_analytics",
        "user_management",
        "roles_permissions",
        "settings"
      ]
    },
    view: { type: Boolean, default: false },
    create: { type: Boolean, default: false },
    edit: { type: Boolean, default: false },
    delete: { type: Boolean, default: false },
    export: { type: Boolean, default: false }
  },
  { _id: false }
);

const roleSchema = new Schema<IRole>(
  {
    name: {
      type: String,
      required: [true, "Role name is required"],
      unique: true,
      trim: true,
      minlength: [2, "Role name must be at least 2 characters"],
      maxlength: [50, "Role name cannot exceed 50 characters"]
    },
    description: {
      type: String,
      default: null,
      trim: true,
      maxlength: [200, "Description cannot exceed 200 characters"]
    },
    color: {
      type: String,
      default: "#2563EB",
      match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Please provide a valid hex color"]
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isDefault: {
      type: Boolean,
      default: false
    },
    permissions: {
      type: [permissionSchema],
      default: []
    },
    userCount: {
      type: Number,
      default: 0,
      min: [0, "User count cannot be negative"]
    },
    createdBy: {
      type: String,
      required: [true, "CreatedBy is required"]
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for formatted role name
roleSchema.virtual('formattedName').get(function() {
  return this.name.charAt(0).toUpperCase() + this.name.slice(1);
});

// Indexes for better performance
roleSchema.index({ name: 1 });
roleSchema.index({ isActive: 1 });
roleSchema.index({ isDefault: 1 });
roleSchema.index({ createdBy: 1 });
roleSchema.index({ createdAt: -1 });

// Compound index for common queries
roleSchema.index({ isActive: 1, isDefault: 1 });

// Pre-save middleware to ensure default roles remain active
roleSchema.pre('save', function(next) {
  if (this.isDefault) {
    this.isActive = true;
  }
  next();
});

// Pre-update middleware
roleSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate() as any;
  // If trying to deactivate a default role, prevent it
  if (update.isActive === false) {
    const error = new Error('Cannot deactivate a default role');
    return next(error);
  }
  next();
});

// Static method to get default roles
roleSchema.static('getDefaultRoles', function() {
  return this.find({ isDefault: true, isActive: true });
});

// Static method to get roles by user
roleSchema.static('getRolesByUser', function(userId: string) {
  return this.find({ createdBy: userId, isActive: true });
});

export const roleModel = model<IRole>("roles", roleSchema);
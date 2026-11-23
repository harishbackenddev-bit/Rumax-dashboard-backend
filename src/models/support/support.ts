// models/support.ts
import mongoose from "mongoose"

const supportSchema = new mongoose.Schema({
    ticketId: {
        type: String,
        unique: true,
        index: true
    },
    category: {
        type: String,
        enum: ["it-issue", "website-update"],
        required: true,
        default: "it-issue"
    },
    priority: {
        type: String,
        enum: ["Low", "Medium", "High", "Urgent"],
        default: "Medium"
    },
    subject: {
        type: String,
        required: true,
        trim: true,
        minlength: 5,
        maxlength: 120
    },
    message: {
        type: String,
        required: true,
        trim: true,
        minlength: 15,
        maxlength: 2000
    },
    status: {
        type: String,
        enum: ["Open", "In Progress", "Resolved", "Closed"],
        default: "Open"
    },

    // Who submitted the ticket
    submittedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "admin",
        required: true
    },
    submitterName: {
        type: String,
        default: null
    },
    submitterEmail: {
        type: String,
        default: null
    },

    // Auto-captured details
    pageUrl: {
        type: String,
        default: null
    },
    userAgent: {
        type: String,
        default: null
    },
    screenSize: {
        type: String,
        default: null
    },
    language: {
        type: String,
        default: null
    },

    // Support team handling
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "admin",
        default: null
    },
    resolutionNote: {
        type: String,
        default: null
    },
    resolvedAt: {
        type: Date,
        default: null
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true })

// Auto-generate a readable ticket id, e.g. SUP-LZ4K9A2X
supportSchema.pre("validate", function (next) {
    if (!this.ticketId) {
        const random = Math.random().toString(36).substring(2, 6).toUpperCase()
        this.ticketId = `SUP-${Date.now().toString(36).toUpperCase()}${random}`
    }
    next()
})

// Set resolvedAt automatically when status moves to Resolved/Closed
supportSchema.pre("save", function (next) {
    if (this.isModified("status")) {
        if (this.status === "Resolved" || this.status === "Closed") {
            this.resolvedAt = new Date()
        } else {
            this.resolvedAt = null
        }
    }
    next()
})

supportSchema.index({ submittedBy: 1, createdAt: -1 })
supportSchema.index({ status: 1, priority: 1 })

export const supportModel = mongoose.model("support", supportSchema)
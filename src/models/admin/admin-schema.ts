// models/admin.ts or wherever your schema is defined
import mongoose from "mongoose"

const adminSchema = new mongoose.Schema({
    identifier: {
        type: String,
        unique: true
    },
    role: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        select: false,
    },
    phoneNumber: {
        type: String,
        default: null
    },
    profilePic: {
        type: String,
        default: null
    },
    timezone: {
        type: String,
        default: null
    },
    department: {
        type: String,
        default: null
    },
    bio: {
        type: String,
        default: null
    },
    address: { 
        type: String,
        default: null 
    },
    twoFactorAuth: {  // <-- Add this field
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true })

export const adminModel = mongoose.model("admin", adminSchema)
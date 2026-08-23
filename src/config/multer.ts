// src/config/multer.ts
import multer from "multer";
import path from "path";
import fs from 'fs';

// Delete file helper function
export const deleteFile = (filePath: string) => {
    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log('File deleted successfully:', filePath);
        }
    } catch (err) {
        console.error('Error deleting file:', err);
    }
};

// Ensure upload directory exists - using public/upload/profile
const uploadDir = path.join(process.cwd(), "public/uploads/profiles");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Get file extension
        const ext = path.extname(file.originalname);
        // Create unique filename with timestamp and random number
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `profile-photo-${uniqueSuffix}${ext}`);
    }
});

// File filter for images only
const fileFilter = (req: any, file: any, cb: any) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only JPEG, PNG, GIF, and WEBP images are allowed'), false);
    }
};

// Create multer instance with error handling
export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5 MB
    },
});

// Export the upload directory for use in other files
export const UPLOAD_DIR = uploadDir;

// Error handler for multer
export const handleMulterError = (err: any) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return { success: false, message: 'File too large. Maximum size is 5MB.' };
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return { success: false, message: 'Unexpected field. Please use "photo" as the field name.' };
        }
        return { success: false, message: err.message };
    }
    if (err) {
        return { success: false, message: err.message };
    }
    return null;
};

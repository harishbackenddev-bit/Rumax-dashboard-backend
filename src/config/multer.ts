// src/config/multer.ts
import multer from "multer";
import path from "path";
import fs from 'fs';

// Delete file helper function
export const deleteFile = (filePath: string) => {
    fs.unlink(filePath, (err) => {
        if (err) {
            console.error('Error deleting file:', err);
        } else {
            console.log('File deleted successfully:', filePath);
        }
    });
};

// Ensure upload directory exists - using public/uploads/profile
const uploadDir = path.join(process.cwd(), "public/uploads/profiles");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        // Store as: profile-photo-{timestamp}-{random}.jpg
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

export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 5, // 5 MB
    },
});

// Export the upload directory for use in other files
export const UPLOAD_DIR = uploadDir;

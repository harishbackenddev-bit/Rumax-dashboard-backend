// config/multer.config.ts
import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

// ============ PROFILE IMAGE UPLOAD ============
const profileUploadDir = "public/uploads/profiles";
if (!fs.existsSync(profileUploadDir)) fs.mkdirSync(profileUploadDir, { recursive: true });

const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, profileUploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, "profile-" + uniqueSuffix + ext);
  },
});

const profileFileFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) cb(null, true);
  else cb(new Error("Only image files are allowed!"));
};

export const uploadProfile = multer({
  storage: profileStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: profileFileFilter,
});

// ============ DOCUMENT UPLOAD (for job applications) ============
const documentUploadDir = "public/uploads/documents";
if (!fs.existsSync(documentUploadDir)) fs.mkdirSync(documentUploadDir, { recursive: true });

const documentStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, documentUploadDir),
  filename: (req, file, cb) => {
    const uniqueId = uuidv4();
    const ext = path.extname(file.originalname);
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
    cb(null, `doc-${uniqueId}${ext}`);
  },
});

const documentFileFilter = (req: any, file: any, cb: any) => {
const allowedTypes = /pdf|doc|docx|jpg|jpeg|png|txt|mp4|webm|mov|avi|mkv/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  // Allow PDF, DOC, DOCX, JPG, JPEG, PNG, TXT
  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF, DOC, DOCX, JPG, JPEG, PNG, and TXT files are allowed!"));
  }
};

export const uploadDocument = multer({
  storage: documentStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: documentFileFilter,
});

// ============ MULTIPLE DOCUMENTS UPLOAD ============
export const uploadMultipleDocuments = multer({
  storage: documentStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per file
  fileFilter: documentFileFilter,
}).array('documents', 10); // Max 10 files

// ============ SINGLE DOCUMENT UPLOAD (with custom field name) ============
export const uploadSingleDocument = (fieldName: string) => {
  return multer({
    storage: documentStorage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: documentFileFilter,
  }).single(fieldName);
};

// ============ TRAINING CERTIFICATE UPLOAD ============
const certificateUploadDir = "public/uploads/certificates";
if (!fs.existsSync(certificateUploadDir)) fs.mkdirSync(certificateUploadDir, { recursive: true });

const certificateStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, certificateUploadDir),
  filename: (req, file, cb) => {
    const uniqueId = uuidv4();
    const ext = path.extname(file.originalname);
    cb(null, `cert-${uniqueId}${ext}`);
  },
});

const certificateFileFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = /pdf|jpg|jpeg|png/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF, JPG, JPEG, and PNG files are allowed!"));
  }
};

export const uploadCertificate = multer({
  storage: certificateStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: certificateFileFilter,
});
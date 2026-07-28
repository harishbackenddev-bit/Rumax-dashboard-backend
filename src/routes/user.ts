import { Router } from "express";
import { login, signup, userdata, forgotPassword, getDashboardStats, deleteAUser, updateAUser,
     twoFactorAuth,
    updateAPassword } from "../controllers/user/user";
import { checkAuth } from "src/middleware/check-auth";
import {uploadProfile, uploadDocument, uploadMultipleDocuments, uploadCertificate} from "src/config/multerConfig";
import {
  profileUpdate,
  documentUpload,
  multipleDocumentsUpload,
  certificateUpload,
  deleteDocument,
} from "../controllers/documentcontroller";
const router = Router();

// ============ AUTH ROUTES ============
router.get("/me", checkAuth, userdata);
router.post("/register", signup);
router.post("/login", login);
router.patch("/forgot-password", forgotPassword);
router.get("/dashboard", checkAuth, getDashboardStats);
router.route("/update-profile").patch(checkAuth, updateAUser).delete(checkAuth, deleteAUser);
router.route("/updatedetails").put(checkAuth, updateAUser).delete(checkAuth, deleteAUser);
router.route("/change-password").post(checkAuth, updateAPassword);
router.route("/two-factor").post(checkAuth, twoFactorAuth);

// ============ PROFILE IMAGE ROUTES ============
router.post(
  "/update-profile-pic",
  uploadProfile.single("profileImage"),
  profileUpdate
);

// ============ DOCUMENT UPLOAD ROUTES ============

// Single document upload
router.post(
  "/upload-document",
  uploadDocument.single("document"),
  documentUpload
);

// Multiple documents upload
router.post(
  "/upload-documents",
  uploadMultipleDocuments,
  multipleDocumentsUpload
);

// Training certificate upload
router.post(
  "/upload-certificate",
  uploadCertificate.single("certificate"),
  certificateUpload
);

// Driving licence upload
router.post(
  "/upload-driving-licence",
  uploadDocument.single("drivingLicence"),
  documentUpload
);

// DBS certificate upload
router.post(
  "/upload-dbs",
  uploadDocument.single("dbsCertificate"),
  documentUpload
);

// References document upload
router.post(
  "/upload-references",
  uploadDocument.single("referencesFile"),
  documentUpload
);

// Cover letter upload
router.post(
  "/upload-cover-letter",
  uploadDocument.single("coverLetter"),
  documentUpload
);

// Resume/CV upload
router.post(
  "/upload-resume",
  uploadDocument.single("resume"),
  documentUpload
);

// ============ DELETE ROUTE ============
router.delete(
  "/delete-document",
  deleteDocument
);

export { router };
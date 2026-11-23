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


router.get("/me", checkAuth, userdata);
router.post("/register", signup);
router.post("/login", login);
router.patch("/forgot-password", forgotPassword);
router.get("/dashboard", checkAuth, getDashboardStats);
router.route("/update-profile").patch(checkAuth, updateAUser).delete(checkAuth, deleteAUser);
router.route("/updatedetails").put(checkAuth, updateAUser).delete(checkAuth, deleteAUser);
router.route("/change-password").post(checkAuth, updateAPassword);
router.route("/two-factor").post(checkAuth, twoFactorAuth);


router.post(
  "/update-profile-pic",
  uploadProfile.single("profileImage"),
  profileUpdate
);




router.post(
  "/upload-document",
  uploadDocument.single("document"),
  documentUpload
);


router.post(
  "/upload-documents",
  uploadMultipleDocuments,
  multipleDocumentsUpload
);


router.post(
  "/upload-certificate",
  uploadCertificate.single("certificate"),
  certificateUpload
);


router.post(
  "/upload-driving-licence",
  uploadDocument.single("drivingLicence"),
  documentUpload
);


router.post(
  "/upload-dbs",
  uploadDocument.single("dbsCertificate"),
  documentUpload
);


router.post(
  "/upload-references",
  uploadDocument.single("referencesFile"),
  documentUpload
);


router.post(
  "/upload-cover-letter",
  uploadDocument.single("coverLetter"),
  documentUpload
);


router.post(
  "/upload-resume",
  uploadDocument.single("resume"),
  documentUpload
);


router.delete(
  "/delete-document",
  deleteDocument
);

export { router };
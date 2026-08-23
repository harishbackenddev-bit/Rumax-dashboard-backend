import { Router } from "express";
import {
    getDashboardStats,updateProfile, updateAPassword, 
      getRoles,getAllUsers, getUserInfo, updateAUser, deleteAUser, createUser,
        getAllJobs,
  getJobInfo,
  createJob,
  updateJob,
  deleteJob,
  publishJob,
  getJobStats,
  getArole,
  updateArole,
  createRole,
  deleteRole,
  initializeDefaultRoles,
  getDefaultRolesList,
  
} from "../controllers/admin/admin";

import {
  getAllCandidates,
  getCandidate,
  createCandidate,
  updateCandidate,
  deleteCandidate,
  getCandidateStats,
  applyForJob,
  getAllstandbyCandidates,
  uploadCandidatePhoto  
} from "../controllers/admin/candidate";

import { upload } from "../config/multer";
import { checkMulter } from "../lib/errors/error-response-handler"
import { checkAuth } from "src/middleware/check-auth";



const router = Router();

router.get("/dashboard", checkAuth, getDashboardStats)
router.route("/update-profile").patch(checkAuth, updateProfile)
router.route("/updatedetails").put(checkAuth, updateProfile)
router.route("/change-password").post(checkAuth, updateAPassword)
router.post("/roles", checkAuth, createRole);
router.get("/roles", checkAuth, getRoles)
router.route("/role/:id").put(checkAuth, updateArole).get(checkAuth, getArole).delete(checkAuth, deleteRole)
router.get("/roles/defaults", checkAuth, getDefaultRolesList);
router.post("/roles/initialize", checkAuth, initializeDefaultRoles);
router.route("/users").get(checkAuth, getAllUsers).post(checkAuth, createUser);
router.route("/user/:id").get(checkAuth, getUserInfo).put(checkAuth, updateAUser).delete(checkAuth, deleteAUser);
router.route("/jobs").get(getAllJobs).post(checkAuth, createJob);
router.route("/job/:id").get(getJobInfo).put(checkAuth, updateJob).delete(checkAuth, deleteJob);
router.get("/jobs/stats", getJobStats);
router.post("/jobs/:id/publish", checkAuth, publishJob);

// Candidate routes
router.get("/candidates", getAllCandidates);
router.get("/candidates/stats", getCandidateStats);
router.post("/candidates", createCandidate); // Create candidate profile
router.post("/candidates/apply", checkAuth, applyForJob); // Apply for job
router.get("/candidate/:id", getCandidate);
// router.put("/candidate/:id", updateCandidate);
router.delete("/candidate/:id", deleteCandidate);
router.post(
    "/candidate/:id/photo",
    upload.single('photo'), // Use multer for file upload
    uploadCandidatePhoto
);
router.patch("/candidate/:id/status", updateCandidate);

router.get("/candidates/standby", getAllstandbyCandidates);

export { router }

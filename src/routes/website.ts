// routes/website/investigatorGuideRoutes.ts
import { Router } from "express";
import { checkAuth } from "../middleware/check-auth";
import {
  saveInvestigatorGuide, saveCallback, saveFeasibility, saveTrialSupport,saveDomiciliaryAssessment, saveTrainingBooking,
  saveFeedback, saveEnquiry, saveReferral, saveCareReadiness, saveFundingPathway, saveCareCost
} from "../controllers/website/website";

const router = Router();

router.post("/investigator-guide/save", saveInvestigatorGuide);
router.post("/callback/save", saveCallback);
router.post("/feasibility/save", saveFeasibility);
router.post("/trial-support/save", saveTrialSupport);

router.post("/domiciliary-assessment/save", saveDomiciliaryAssessment);
router.post("/training-booking/save", saveTrainingBooking);

router.post("/feedback/save", saveFeedback);

router.post("/enquiry/save", saveEnquiry);

router.post("/referral/save", saveReferral);

router.post("/care-readiness/save", saveCareReadiness);

router.post("/funding-pathway/save", saveFundingPathway);

router.post("/care-cost/save", saveCareCost);

export { router };
// controllers/website/investigatorGuideController.ts
import { Request, Response } from "express";
import { errorParser } from "../../lib/errors/error-response-handler";
import { httpStatusCode } from "../../lib/constant";
import {
    saveInvestigatorGuideService,
    saveCallbackService,
     saveFeasibilityService,
     saveTrialSupportService,
     saveDomiciliaryAssessmentService,
     saveTrainingBookingService,
     saveFeedbackService,
     saveEnquiryService,
     saveReferralService,
     saveCareReadinessService,
     saveFundingPathwayService,
     saveCareCostService
} from "../../services/website/website";

// ✅ Save form
export const saveInvestigatorGuide = async (req: Request, res: Response) => {
    try {
        const response = await saveInvestigatorGuideService(req.body, req, res);
        return res.status(httpStatusCode.CREATED).json(response);
    } catch (error: any) {
        const { code, message } = errorParser(error);
        return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: message || "An error occurred",
        });
    }
};

export const saveCallback = async (req: Request, res: Response) => {
  try {
    const response = await saveCallbackService(req.body, req, res);
    return res.status(httpStatusCode.CREATED).json(response);
  } catch (error: any) {
    const { code, message } = errorParser(error);
    return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: message || "An error occurred",
    });
  }
};

export const saveFeasibility = async (req: Request, res: Response) => {
  try {
    const response = await saveFeasibilityService(req.body, req, res);
    return res.status(httpStatusCode.CREATED).json(response);
  } catch (error: any) {
    const { code, message } = errorParser(error);
    return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: message || "An error occurred",
    });
  }
};

export const saveTrialSupport = async (req: Request, res: Response) => {
  try {
    const response = await saveTrialSupportService(req.body, req, res);
    return res.status(httpStatusCode.CREATED).json(response);
  } catch (error: any) {
    const { code, message } = errorParser(error);
    return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: message || "An error occurred",
    });
  }
};

export const saveDomiciliaryAssessment = async (req: Request, res: Response) => {
  try {
    const response = await saveDomiciliaryAssessmentService(req.body, req, res);
    return res.status(httpStatusCode.CREATED).json(response);
  } catch (error: any) {
    const { code, message } = errorParser(error);
    return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: message || "An error occurred",
    });
  }
};

export const saveTrainingBooking = async (req: Request, res: Response) => {
  try {
    const response = await saveTrainingBookingService(req.body, req, res);
    return res.status(httpStatusCode.CREATED).json(response);
  } catch (error: any) {
    const { code, message } = errorParser(error);
    return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: message || "An error occurred",
    });
  }
};

export const saveFeedback = async (req: Request, res: Response) => {
  try {
    const response = await saveFeedbackService(req.body, req, res);
    return res.status(httpStatusCode.CREATED).json(response);
  } catch (error: any) {
    const { code, message } = errorParser(error);
    return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: message || "An error occurred",
    });
  }
};


export const saveEnquiry = async (req: Request, res: Response) => {
  try {
    const response = await saveEnquiryService(req.body, req, res);
    return res.status(httpStatusCode.CREATED).json(response);
  } catch (error: any) {
    const { code, message } = errorParser(error);
    return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: message || "An error occurred",
    });
  }
};


export const saveReferral = async (req: Request, res: Response) => {
  try {
    const response = await saveReferralService(req.body, req, res);
    return res.status(httpStatusCode.CREATED).json(response);
  } catch (error: any) {
    const { code, message } = errorParser(error);
    return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: message || "An error occurred",
    });
  }
};


export const saveCareReadiness = async (req: Request, res: Response) => {
  try {
    const response = await saveCareReadinessService(req.body, req, res);
    return res.status(httpStatusCode.CREATED).json(response);
  } catch (error: any) {
    const { code, message } = errorParser(error);
    return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: message || "An error occurred",
    });
  }
};


export const saveFundingPathway = async (req: Request, res: Response) => {
  try {
    const response = await saveFundingPathwayService(req.body, req, res);
    return res.status(httpStatusCode.CREATED).json(response);
  } catch (error: any) {
    const { code, message } = errorParser(error);
    return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: message || "An error occurred",
    });
  }
};


export const saveCareCost = async (req: Request, res: Response) => {
  try {
    const response = await saveCareCostService(req.body, req, res);
    return res.status(httpStatusCode.CREATED).json(response);
  } catch (error: any) {
    const { code, message } = errorParser(error);
    return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: message || "An error occurred",
    });
  }
};





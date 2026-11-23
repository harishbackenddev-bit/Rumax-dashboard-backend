import { Request, Response } from "express";
import { httpStatusCode } from "../../lib/constant";
import { errorParser } from "../../lib/errors/error-response-handler";
import {
  getAllCandidatesService,
  getCandidateService,
  createCandidateService,
  deleteCandidateService,
  updateCandidateStatusService,
  getCandidateStatsService,
  applyForJobService,
  updateCandidateService,
  getAllstandbyCandidatesService,
  uploadCandidatePhotoService,
  deleteCandidatePhotoService,
} from "../../services/admin/candidate-service";

export const getAllCandidates = async (req: Request, res: Response) => {
  try {
    const response = await getAllCandidatesService(req.query);
    return res.status(httpStatusCode.OK).json(response);
  } catch (error: any) {
    const { code, message } = errorParser(error);
    return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: message || "An error occurred"
    });
  }
};

export const getAllstandbyCandidates = async (req: Request, res: Response) => {
  try {
    const response = await getAllstandbyCandidatesService(req.query);
    return res.status(httpStatusCode.OK).json(response);
  } catch (error: any) {
    const { code, message } = errorParser(error);
    return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: message || "An error occurred"
    });
  }
};



export const uploadCandidatePhoto = async (req: Request, res: Response) => {
    try {
        const candidateId = req.params.id;
        const file = req.file;
        
        
        if (!file) {
            return res.status(httpStatusCode.BAD_REQUEST).json({
                success: false,
                message: "No photo file uploaded. Please select an image file."
            });
        }

        
        console.log('File uploaded:', {
            filename: file.filename,
            path: file.path,
            size: file.size,
            mimetype: file.mimetype
        });

        const response = await uploadCandidatePhotoService(candidateId, file, res);
        
        
        if (response && response.success === false) {
            
            if (file.path && fs.existsSync(file.path)) {
                deleteFile(file.path);
            }
            return res.status(httpStatusCode.BAD_REQUEST).json(response);
        }
        
        return res.status(httpStatusCode.OK).json(response);
    } catch (error: any) {
        console.error('Upload photo controller error:', error);
        
        if (req.file && req.file.path && fs.existsSync(req.file.path)) {
            deleteFile(req.file.path);
        }
        const { code, message } = errorParser(error);
        return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: message || "An error occurred while uploading photo"
        });
    }
};

export const deleteCandidatePhoto = async (req: Request, res: Response) => {
    try {
        const candidateId = req.params.id;
        const response = await deleteCandidatePhotoService(candidateId, res);
        
        if (response && !response.success) {
            return res.status(httpStatusCode.BAD_REQUEST).json(response);
        }
        
        return res.status(httpStatusCode.OK).json(response);
    } catch (error: any) {
        const { code, message } = errorParser(error);
        return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: message || "An error occurred"
        });
    }
};


export const getCandidate = async (req: Request, res: Response) => {
  try {
    const response = await getCandidateService(req.params.id, res);
    return res.status(httpStatusCode.OK).json(response);
  } catch (error: any) {
    const { code, message } = errorParser(error);
    return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: message || "An error occurred"
    });
  }
};


export const createCandidate = async (req: Request, res: Response) => {
  try {
    const response = await createCandidateService(req.body, res);

    if (response && !response.success) {
      return res.status(httpStatusCode.BAD_REQUEST).json(response);
    }

    return res.status(httpStatusCode.CREATED).json(response);
  } catch (error: any) {
    const { code, message } = errorParser(error);
    return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: message || "An error occurred"
    });
  }
};


export const applyForJob = async (req: Request, res: Response) => {
  try {
    const response = await applyForJobService(req.body, res);

    if (response && !response.success) {
      return res.status(httpStatusCode.BAD_REQUEST).json(response);
    }

    return res.status(httpStatusCode.OK).json(response);
  } catch (error: any) {
    const { code, message } = errorParser(error);
    return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: message || "An error occurred"
    });
  }
};






export const updateCandidate = async (req: Request, res: Response) => {
  try {
    const response = await updateCandidateService(req.params.id, req.body, res);

    if (response && !response.success) {
      return res.status(httpStatusCode.BAD_REQUEST).json(response);
    }

    return res.status(httpStatusCode.OK).json(response);
  } catch (error: any) {
    const { code, message } = errorParser(error);
    return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: message || "An error occurred"
    });
  }
};


export const deleteCandidate = async (req: Request, res: Response) => {
  try {
    const response = await deleteCandidateService(req.params.id, res);

    if (response && !response.success) {
      return res.status(httpStatusCode.BAD_REQUEST).json(response);
    }

    return res.status(httpStatusCode.OK).json(response);
  } catch (error: any) {
    const { code, message } = errorParser(error);
    return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: message || "An error occurred"
    });
  }
};


export const updateCandidateStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(httpStatusCode.BAD_REQUEST).json({
        success: false,
        message: "Status is required"
      });
    }

    const response = await updateCandidateStatusService(req.params.id, status, res);

    if (response && !response.success) {
      return res.status(httpStatusCode.BAD_REQUEST).json(response);
    }

    return res.status(httpStatusCode.OK).json(response);
  } catch (error: any) {
    const { code, message } = errorParser(error);
    return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: message || "An error occurred"
    });
  }
};


export const getCandidateStats = async (req: Request, res: Response) => {
  try {
    const response = await getCandidateStatsService();
    return res.status(httpStatusCode.OK).json(response);
  } catch (error: any) {
    const { code, message } = errorParser(error);
    return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: message || "An error occurred"
    });
  }
};

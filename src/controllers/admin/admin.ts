import { Request, Response } from "express"
import { formatZodErrors } from "../../validation/format-zod-errors";
import {
    loginService, newPassswordAfterOTPVerifiedService, forgotPasswordService, getAllUsersService,
    getAUserService, updateAUserService, deleteAUserService, getDashboardStatsService, updateAProfileService, updateAPasswordService,
  getRolesService,
  getAroleService,
  updateAroleService,
  createRoleService,
  deleteRoleService,
  initializeDefaultRolesService,
  getDefaultRolesListService,
  createuserService,getUserInfoService,
  getAllJobsService,
  getJobInfoService,
  createJobService,
  updateJobService,
  deleteJobService,
  publishJobService,
  getJobStatsService
} from "../../services/admin/admin-service";
import { errorParser } from "../../lib/errors/error-response-handler";
import { httpStatusCode } from "../../lib/constant";
import { z } from "zod";
import mongoose from "mongoose";


//Auth Controllers
export const login = async (req: Request, res: Response) => {
    try {

        const response = await loginService(req.body, res)
        return res.status(httpStatusCode.OK).json(response)

    } catch (error: any) {
        const { code, message } = errorParser(error)
        return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: message || "An error occurred" });
    }
}

export const forgotPassword = async (req: Request, res: Response) => {

    try {
        const response = await forgotPasswordService(req.body, res)
        return res.status(httpStatusCode.OK).json(response)
    }
    catch (error: any) {
        const { code, message } = errorParser(error)
        return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: message || "An error occurred" });
    }
}

export const newPassswordAfterOTPVerified = async (req: Request, res: Response) => {
    try {
        const response = await newPassswordAfterOTPVerifiedService(req.body, res)
        return res.status(httpStatusCode.OK).json(response)
    }
    catch (error: any) {
        const { code, message } = errorParser(error)
        return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: message || "An error occurred" });
    }
}

export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const response = await getAllUsersService(req.query)
        return res.status(httpStatusCode.OK).json(response)
    } catch (error: any) {
        const { code, message } = errorParser(error)
        return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: message || "An error occurred" });
    }
}


export const getAUser = async (req: Request, res: Response) => {
    try {
        const response = await getAUserService(req.params.id, res)
        return res.status(httpStatusCode.OK).json(response)
    } catch (error: any) {
        const { code, message } = errorParser(error)
        return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: message || "An error occurred" });
    }
}

export const deleteAUser = async (req: Request, res: Response) => {
    try {
        const response = await deleteAUserService(req.params.id, res)
        return res.status(httpStatusCode.OK).json(response)
    } catch (error: any) {
        const { code, message } = errorParser(error)
        return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: message || "An error occurred" });
    }
}

export const updateAUser = async (req: Request, res: Response) => {
    try {
        const response = await updateAUserService(req.params.id, req.body, res);
        return res.status(httpStatusCode.OK).json(response)
    } catch (error: any) {
        const { code, message } = errorParser(error)
        return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: message || "An error occurred" });
    }
}

export const createUser = async (req: Request, res: Response) => {
    try {
        const response = await createuserService({ currentUser: (req as any).currentUser, ...req.body }, res)
        return res.status(httpStatusCode.CREATED).json(response)
    } catch (error: any) {
        const { code, message } = errorParser(error)
        return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: message || "An error occurred" });
    }
}



export const getUserInfo = async (req: Request, res: Response) => {
    try {
        const response = await getUserInfoService(req.params.id, res)
        return res.status(httpStatusCode.OK).json(response)
    } catch (error: any) {
        const { code, message } = errorParser(error)
        return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: message || "An error occurred" });
    }
}

export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        const response = await getDashboardStatsService(req, res)
        return res.status(httpStatusCode.OK).json(response)
    } catch (error: any) {
        const { code, message } = errorParser(error)
        return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: message || "An error occurred" });
    }
}


export const updateProfile = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).currentUser;
        const response = await updateAProfileService({ userId, body: req.body }, res);
        return res.status(httpStatusCode.OK).json(response)
    } catch (error: any) {
        const { code, message } = errorParser(error)
        return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: message || "An error occurred" });
    }
}


export const updateAPassword = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).currentUser;
        const response = await updateAPasswordService({ userId, body: req.body }, res);
        return res.status(httpStatusCode.OK).json(response)
    } catch (error: any) {
        const { code, message } = errorParser(error)
        return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: message || "An error occurred" });
    }
}

export const getRoles = async (req: Request, res: Response) => {
  try {
    const response = await getRolesService(req, res);
    return res.status(httpStatusCode.OK).json(response);
  } catch (error: any) {
    const { code, message } = errorParser(error);
    return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({ 
      success: false, 
      message: message || "An error occurred" 
    });
  }
};

export const getArole = async (req: Request, res: Response) => {
  try {
    const response = await getAroleService(req.params.id, res);
    return res.status(httpStatusCode.OK).json(response);
  } catch (error: any) {
    const { code, message } = errorParser(error);
    return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({ 
      success: false, 
      message: message || "An error occurred" 
    });
  }
};

export const createRole = async (req: Request, res: Response) => {
  try {
        const userId = (req as any).currentUser;
        const response = await createRoleService({ userId, body: req.body }, res)

    return res.status(httpStatusCode.CREATED).json(response);
  } catch (error: any) {
    const { code, message } = errorParser(error);
    return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({ 
      success: false, 
      message: message || "An error occurred" 
    });
  }
};

export const updateArole = async (req: Request, res: Response) => {
  try {
    const response = await updateAroleService(req.params.id, req.body, res);
    return res.status(httpStatusCode.OK).json(response);
  } catch (error: any) {
    const { code, message } = errorParser(error);
    return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({ 
      success: false, 
      message: message || "An error occurred" 
    });
  }
};

export const deleteRole = async (req: Request, res: Response) => {
  try {
    const response = await deleteRoleService(req.params.id, res);
    return res.status(httpStatusCode.OK).json(response);
  } catch (error: any) {
    const { code, message } = errorParser(error);
    return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({ 
      success: false, 
      message: message || "An error occurred" 
    });
  }
};

export const initializeDefaultRoles = async (req: Request, res: Response) => {
  try {
const userId = (req as any).currentUser;
        const response = await initializeDefaultRolesService({ userId, body: req.body }, res)

    return res.status(httpStatusCode.OK).json(response);
  } catch (error: any) {
    const { code, message } = errorParser(error);
    return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({ 
      success: false, 
      message: message || "An error occurred" 
    });
  }
};

export const getDefaultRolesList = async (req: Request, res: Response) => {
  try {
    const response = await getDefaultRolesListService(res);
    return res.status(httpStatusCode.OK).json(response);
  } catch (error: any) {
    const { code, message } = errorParser(error);
    return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({ 
      success: false, 
      message: message || "An error occurred" 
    });
  }
};  


// Get all jobs
export const getAllJobs = async (req: Request, res: Response) => {
  try {
    const response = await getAllJobsService(req.query);
    return res.status(httpStatusCode.OK).json(response);
  } catch (error: any) {
    const { code, message } = errorParser(error);
    return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: message || "An error occurred"
    });
  }
};

// Get job by ID
export const getJobInfo = async (req: Request, res: Response) => {
  try {
    const response = await getJobInfoService(req.params.id, res);
    return res.status(httpStatusCode.OK).json(response);
  } catch (error: any) {
    const { code, message } = errorParser(error);
    return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: message || "An error occurred"
    });
  }
};

// Create job
export const createJob = async (req: Request, res: Response) => {
  try {
   const userId = (req as any).currentUser;
    
    if (!userId) {
      return res.status(httpStatusCode.UNAUTHORIZED).json({
        success: false,
        message: "User not authenticated"
      });
    }

    const response = await createJobService(req.body, userId, res);
    
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

// Update job
export const updateJob = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).currentUser;
    
    if (!userId) {
      return res.status(httpStatusCode.UNAUTHORIZED).json({
        success: false,
        message: "User not authenticated"
      });
    }

    const response = await updateJobService(req.params.id, req.body, res);
    
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

// Delete job
export const deleteJob = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).currentUser;
    
    if (!userId) {
      return res.status(httpStatusCode.UNAUTHORIZED).json({
        success: false,
        message: "User not authenticated"
      });
    }

    const response = await deleteJobService(req.params.id, res);
    
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

// Publish job
export const publishJob = async (req: Request, res: Response) => {
  try {
   const userId = (req as any).currentUser;
    
    if (!userId) {
      return res.status(httpStatusCode.UNAUTHORIZED).json({
        success: false,
        message: "User not authenticated"
      });
    }

    const response = await publishJobService(req.params.id, res);
    
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

// Get job statistics
export const getJobStats = async (req: Request, res: Response) => {
  try {
    const response = await getJobStatsService();
    return res.status(httpStatusCode.OK).json(response);
  } catch (error: any) {
    const { code, message } = errorParser(error);
    return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: message || "An error occurred"
    });
  }
};
import { adminModel } from "../../models/admin/admin-schema";
import bcrypt from "bcryptjs";
import { Response } from "express";
import { errorResponseHandler } from "../../lib/errors/error-response-handler";
import { httpStatusCode } from "../../lib/constant";
import { queryBuilder } from "../../utils";
import { sendPasswordResetEmail } from "src/utils/mails/mail";
import { generatePasswordResetToken, getPasswordResetTokenByToken, generatePasswordResetTokenByPhone } from "src/utils/mails/token";
import { generatePasswordResetTokenByPhoneWithTwilio } from "../../utils/sms/sms"
import { passwordResetTokenModel } from "src/models/password-token-schema";
import { usersModel } from "src/models/user/user-schema";
import { customAlphabet } from "nanoid"
import { roleModel } from "../../models/roles/roles-schema";
import { defaultRoles, IDefaultRole } from "../../utils/defaultRoles";
import { jobModel, IJob } from "../../models/job/job-schema";
import { applicationModel } from "../../models/job/application-schema";
import { candidateModel } from "../../models/candidate/candidate-schema";

export const loginService = async (payload: any, res: Response) => {
    const { username, password } = payload;
    const countryCode = "+45";
    const toNumber = Number(username);
    const isEmail = isNaN(toNumber);
    let user: any = null;

    if (isEmail) {

        user = await adminModel.findOne({ email: username }).select('+password');
        if (!user) {
            user = await usersModel.findOne({ email: username }).select('+password');
        }
    } else {

        const formattedPhoneNumber = `${countryCode}${username}`;
        user = await adminModel.findOne({ phoneNumber: formattedPhoneNumber }).select('+password');
        if (!user) {
            user = await usersModel.findOne({ phoneNumber: formattedPhoneNumber }).select('+password');
        }
    }

    if (!user) return errorResponseHandler('User not found', httpStatusCode.NOT_FOUND, res);
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return errorResponseHandler('Invalid password', httpStatusCode.UNAUTHORIZED, res);
    }
    const userObject = user.toObject();
    delete userObject.password;

    return {
        success: true,
        message: "Login successful",
        data: {
            user: userObject,
        },
    };
};


export const forgotPasswordService = async (payload: any, res: Response) => {
    const { username } = payload;
    const countryCode = "+91";
    const toNumber = Number(username);
    const isEmail = isNaN(toNumber);
    let user: any = null;
    if (isEmail) {

        user = await adminModel.findOne({ email: username }).select('+password');
        if (!user) {
            user = await usersModel.findOne({ email: username }).select('+password');
        }
        if (!user) return errorResponseHandler('User not found', httpStatusCode.NOT_FOUND, res);

        const passwordResetToken = await generatePasswordResetToken(username);
        if (passwordResetToken) {
            await sendPasswordResetEmail(username, passwordResetToken.token);
            return { success: true, message: "Password reset email sent with OTP" };
        }
    } else {
        const formattedPhoneNumber = `${countryCode}${username}`;
        user = await adminModel.findOne({ phoneNumber: formattedPhoneNumber }).select('+password');
        if (!user) {
            user = await usersModel.findOne({ phoneNumber: formattedPhoneNumber }).select('+password');
        }
        if (!user) return errorResponseHandler('User not found', httpStatusCode.NOT_FOUND, res);

        const passwordResetTokenBySms = await generatePasswordResetTokenByPhone(formattedPhoneNumber);
        if (passwordResetTokenBySms) {
            await generatePasswordResetTokenByPhoneWithTwilio(formattedPhoneNumber, passwordResetTokenBySms.token);
            return { success: true, message: "Password reset SMS sent with OTP" };
        }
    }

    return errorResponseHandler('Failed to generate password reset token', httpStatusCode.INTERNAL_SERVER_ERROR, res);
};


export const newPassswordAfterOTPVerifiedService = async (payload: { password: string, otp: string }, res: Response) => {
    // console.log('payload: ', payload);
    const { password, otp } = payload

    const existingToken = await getPasswordResetTokenByToken(otp)
    if (!existingToken) return errorResponseHandler("Invalid OTP", httpStatusCode.BAD_REQUEST, res)

    const hasExpired = new Date(existingToken.expires) < new Date()
    if (hasExpired) return errorResponseHandler("OTP expired", httpStatusCode.BAD_REQUEST, res)

    let existingAdmin: any;

    if (existingToken.email) {
        existingAdmin = await adminModel.findOne({ email: existingToken.email });
    }
    else if (existingToken.phoneNumber) {
        existingAdmin = await adminModel.findOne({ phoneNumber: existingToken.phoneNumber });
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const response = await adminModel.findByIdAndUpdate(existingAdmin._id, { password: hashedPassword }, { new: true });
    await passwordResetTokenModel.findByIdAndDelete(existingToken._id);

    return {
        success: true,
        message: "Password updated successfully",
        data: response
    }
}


export const getAllUsersService = async (payload: any) => {
    const page = parseInt(payload.page as string) || 1
    const limit = parseInt(payload.limit as string) || 0
    const offset = (page - 1) * limit
    const { query, sort } = queryBuilder(payload, ['fullName'])
    const totalDataCount = Object.keys(query).length < 1 ? await usersModel.countDocuments() : await usersModel.countDocuments(query)
    const results = await usersModel.find(query).sort(sort).skip(offset).limit(limit).select("-__v")
    if (results.length) return {
        page,
        limit,
        success: true,
        total: totalDataCount,
        data: results
    }
    else {
        return {
            data: [],
            page,
            limit,
            success: false,
            total: 0
        }
    }
}

export const getAUserService = async (id: string, res: Response) => {
    //   const user = await usersModel.findById(id);
    //   if (!user) return errorResponseHandler("User not found", httpStatusCode.NOT_FOUND, res);

    //   const userProjects = await projectsModel.find({ userId: id }).select("-__v");

    //   return {
    //       success: true,
    //       message: "User retrieved successfully",
    //       data: {
    //           user,
    //           projects: userProjects.length > 0 ? userProjects : [],
    //       }
    //   };
}


export const updateAUserService = async (id: string, payload: any, res: Response) => {
    const user = await usersModel.findById(id);
    if (!user) return errorResponseHandler("User not found", httpStatusCode.NOT_FOUND, res);
    const countryCode = "+45";
    payload.phoneNumber = `${countryCode}${payload.phoneNumber}`;
    const updateduser = await usersModel.findByIdAndUpdate(id, { ...payload }, { new: true });

    return {
        success: true,
        message: "User updated successfully",
        data: updateduser,
    };

};




export const deleteAUserService = async (id: string, res: Response) => {
    // const user = await usersModel.findById(id);
    // if (!user) return errorResponseHandler("User not found", httpStatusCode.NOT_FOUND, res);

    // // Delete user projects ----
    // const userProjects = await projectsModel.deleteMany({ userId: id })

    // // Delete user ----
    // await usersModel.findByIdAndDelete(id)

    // return {
    //     success: true,
    //     message: "User deleted successfully",
    //     data: {
    //         user,
    //         projects: userProjects
    //     }
    // }
}



export const updateAProfileService = async (payload: any, res: Response) => {
  const userId = payload.userId;
  const body = payload.body;
  // console.log("userIdpayload", userId);
  // console.log("bodypayload", body);
  const user = await adminModel.findById(userId);
  if (!user) return errorResponseHandler("User not found", httpStatusCode.NOT_FOUND, res);
  const updateduser = await adminModel.findByIdAndUpdate(userId, { ...body }, { new: true });
  return {
    success: true,
    message: "User data retrieved successfully",
    data: updateduser
  };
};

export const getUserInfoService = async (id: string, res: Response) => {
  const user = await usersModel.findById(id);
  if (!user)
    return errorResponseHandler(
      "User not found",
      httpStatusCode.NOT_FOUND,
      res
    );

  return {
    success: true,
    message: "User retrieved successfully",
    data: {
      user,
    },
  };
};

export const createuserService = async (payload: any, res: Response) => {
  // Check if the email already exists
  const existingUser = await usersModel.findOne({ email: payload.email });

  if (existingUser) {
    return errorResponseHandler(
      "Email already exists",
      httpStatusCode.BAD_REQUEST,
      res
    );
  }

  // Proceed with creating the user
  const currentUserId = payload.currentUser;

  const identifier = customAlphabet("0123456789", 3);
  payload.identifier = identifier();
  const user = new usersModel({
    ...payload,
  });

  await user.save();

  return {
    success: true,
    message: "User created successfully",
  };
};

export const updateAPasswordService = async (payload: any, res: Response) => {
  const userId = payload.userId;
  const { currentPassword, newPassword } = payload.body;

  const user = await adminModel.findById(userId).select("+password");


  if (!user) { return errorResponseHandler("User not found", httpStatusCode.NOT_FOUND, res); }

  // Check current password
  const isPasswordMatched = await bcrypt.compare(
    currentPassword,
    user.password
  );

  if (!isPasswordMatched) {
    return errorResponseHandler(
      "Current password is incorrect",
      httpStatusCode.BAD_REQUEST,
      res
    );
  }

  // Hash new password
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

  // Update password
  await adminModel.findByIdAndUpdate(
    userId,
    {
      password: hashedPassword,
    },
    {
      new: true,
    }
  );

  return {
    success: true,
    message: "Password updated successfully",
  };
};



// Dashboard

export const getDashboardStatsService = async (payload: any, res: Response) => {
    const currentDate = new Date();



    return currentDate;
};

// Get all roles
export const getRolesService = async (req: any, res: Response) => {
  try {
    const roles = await roleModel.find({ isActive: true })
      .sort({ createdAt: -1 })
      .select("-__v");

    return {
      success: true,
      message: "Roles retrieved successfully",
      data: roles,
      count: roles.length
    };
  } catch (error: any) {
    return errorResponseHandler(
      error.message || "Failed to fetch roles",
      httpStatusCode.INTERNAL_SERVER_ERROR,
      res
    );
  }
};

// Get single role by ID
export const getAroleService = async (id: string, res: Response) => {
  try {
    const role = await roleModel.findById(id).select("-__v");
    
    if (!role) {
      return errorResponseHandler("Role not found", httpStatusCode.NOT_FOUND, res);
    }

    return {
      success: true,
      message: "Role retrieved successfully",
      data: role
    };
  } catch (error: any) {
    return errorResponseHandler(
      error.message || "Failed to fetch role",
      httpStatusCode.INTERNAL_SERVER_ERROR,
      res
    );
  }
};

export const createRoleService = async (
  payload: any,
  res: Response
) => {
  try {
    // Log payload for debugging
    console.log('Create Role Payload:', JSON.stringify(payload, null, 2));

    // Check if payload exists
    if (!payload) {
      return errorResponseHandler(
        "Request body is empty",
        httpStatusCode.BAD_REQUEST,
        res
      );
    }

    // Extract data from payload - handle the structure: { userId, body }
    const body = payload.body || payload;
    const userId = payload.userId || "system";
    const { name, description, color, permissions } = body;

    // Validate required fields
    if (!name) {
      return errorResponseHandler(
        "Role name is required",
        httpStatusCode.BAD_REQUEST,
        res
      );
    }

    const trimmedName = name.trim();
    if (!trimmedName) {
      return errorResponseHandler(
        "Role name cannot be empty",
        httpStatusCode.BAD_REQUEST,
        res
      );
    }

    // Check if role already exists
    const existingRole = await roleModel.findOne({
      name: trimmedName
    });

    if (existingRole) {
      return errorResponseHandler(
        `Role "${trimmedName}" already exists`,
        httpStatusCode.BAD_REQUEST,
        res
      );
    }

    // Create new role
    const newRole = new roleModel({
      name: trimmedName,
      description: description || null,
      color: color || "#2563EB",
      permissions: permissions || [],
      createdBy: userId,
      isActive: true
    });

    await newRole.save();

    return {
      success: true,
      message: `Role "${trimmedName}" created successfully`,
      data: newRole
    };
  } catch (error: any) {
    console.error('Create Role Service Error:', error);
    return errorResponseHandler(
      error.message || "Failed to create role",
      httpStatusCode.INTERNAL_SERVER_ERROR,
      res
    );
  }
};

// Update role
export const updateAroleService = async (id: string, payload: any, res: Response) => {
  try {
    const { name, description, color, permissions, isActive } = payload;

    const role = await roleModel.findById(id);
    
    if (!role) {
      return errorResponseHandler("Role not found", httpStatusCode.NOT_FOUND, res);
    }

    // Check if name is taken by another role
    if (name && name !== role.name) {
      const existingRole = await roleModel.findOne({ 
        name: name.trim(),
        _id: { $ne: id }
      });
      
      if (existingRole) {
        return errorResponseHandler(
          "Role with this name already exists",
          httpStatusCode.BAD_REQUEST,
          res
        );
      }
      role.name = name.trim();
    }

    // Update fields
    if (description !== undefined) role.description = description;
    if (color) role.color = color;
    if (permissions) role.permissions = permissions;
    if (isActive !== undefined) role.isActive = isActive;

    await role.save();

    return {
      success: true,
      message: "Role updated successfully",
      data: role
    };
  } catch (error: any) {
    return errorResponseHandler(
      error.message || "Failed to update role",
      httpStatusCode.INTERNAL_SERVER_ERROR,
      res
    );
  }
};

// Delete role (soft delete)
export const deleteRoleService = async (id: string, res: Response) => {
  try {
    const role = await roleModel.findById(id);
    
    if (!role) {
      return errorResponseHandler("Role not found", httpStatusCode.NOT_FOUND, res);
    }

    // Check if role has users assigned
    if (role.userCount > 0) {
      return errorResponseHandler(
        "Cannot delete role with assigned users",
        httpStatusCode.BAD_REQUEST,
        res
      );
    }

    // Check if role is default
    if (role.isDefault) {
      return errorResponseHandler(
        "Cannot delete default role",
        httpStatusCode.BAD_REQUEST,
        res
      );
    }

    // Soft delete
    role.isActive = false;
    await role.save();

    return {
      success: true,
      message: "Role deleted successfully",
      data: role
    };
  } catch (error: any) {
    return errorResponseHandler(
      error.message || "Failed to delete role",
      httpStatusCode.INTERNAL_SERVER_ERROR,
      res
    );
  }
};

// Initialize default roles
export const initializeDefaultRolesService = async (  payload: any,
  res: Response) => {
  try {
    let createdCount = 0;
    let skippedCount = 0;

    for (const defaultRole of defaultRoles) {
      const existingRole = await roleModel.findOne({ 
        name: defaultRole.name 
      });

      if (!existingRole) {
        const newRole = new roleModel({
          ...defaultRole,
          createdBy: "system"
        });
        await newRole.save();
        createdCount++;
      } else {
        skippedCount++;
      }
    }

    return {
      success: true,
      message: `${createdCount} default roles initialized, ${skippedCount} already exist`,
      data: {
        created: createdCount,
        skipped: skippedCount,
        total: defaultRoles.length
      }
    };
  } catch (error: any) {
    return errorResponseHandler(
      error.message || "Failed to initialize default roles",
      httpStatusCode.INTERNAL_SERVER_ERROR,
      res
    );
  }
};

// Get default roles list
export const getDefaultRolesListService = async (res: Response) => {
  try {
    return {
      success: true,
      message: "Default roles retrieved successfully",
      data: defaultRoles
    };
  } catch (error: any) {
    return errorResponseHandler(
      error.message || "Failed to fetch default roles",
      httpStatusCode.INTERNAL_SERVER_ERROR,
      res
    );
  }
};


// Get all jobs with pagination and filtering
export const getAllJobsService = async (payload: any) => {
  try {
    const page = parseInt(payload.page as string) || 1;
    const limit = parseInt(payload.limit as string) || 10;
    const skip = (page - 1) * limit;
    
    // Build query
    const query: any = { isDeleted: false };
    
    // Filter by status
    if (payload.status) {
      query.status = payload.status;
    }
    
    // Filter by availability
    if (payload.availability) {
      query.availability = payload.availability;
    }
    
    // Filter by contract type
    if (payload.contractType) {
      query.contractType = payload.contractType;
    }
    
    // Filter by location
    if (payload.location) {
      query.locations = { $in: [payload.location] };
    }
    
    // Search by title or notes
    if (payload.search) {
      query.$or = [
        { jobTitle: { $regex: payload.search, $options: "i" } },
        { notes: { $regex: payload.search, $options: "i" } }
      ];
    }
    
    // Sort
    const sort: any = {};
    const sortField = payload.sortBy || "createdAt";
    const sortOrder = payload.sortOrder === "asc" ? 1 : -1;
    sort[sortField] = sortOrder;
    
    const totalDataCount = await jobModel.countDocuments(query);
    const results = await jobModel.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select("-__v");
    
    if (results.length) {
      return {
        page,
        limit,
        success: true,
        total: totalDataCount,
        data: results
      };
    } else {
      return {
        data: [],
        page,
        limit,
        success: true,
        total: 0
      };
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to fetch jobs",
      data: [],
      total: 0,
      page: 1,
      limit: 10
    };
  }
};

// Get single job by ID with applied candidates
export const getJobInfoService = async (id: string, res: Response) => {
  try {
    const job = await jobModel.findOne({
      _id: id,
      isDeleted: false,
    }).select("-__v");

    if (!job) {
      return errorResponseHandler(
        "Job not found",
        httpStatusCode.NOT_FOUND,
        res
      );
    }

    const applications = await applicationModel.find({
      jobId: id,
      isDeleted: false,
    });

    const applicationsWithCandidates = await Promise.all(
      applications.map(async (application) => {
        const candidate = await candidateModel.findById(application.candidateId);

        return {
          ...application.toObject(),
          candidate,
        };
      })
    );

    return {
      success: true,
      message: "Job retrieved successfully",
      data: {
        ...job.toObject(),
        applications: applicationsWithCandidates,
      },
    };
  } catch (error: any) {
    return errorResponseHandler(
      error.message || "Failed to fetch job",
      httpStatusCode.INTERNAL_SERVER_ERROR,
      res
    );
  }
};

// Create job (Draft or Publish)
export const createJobService = async (payload: any, userId: string, res: Response) => {
  try {
    const {
      jobTitle,
      availability,
      experience,
      contractType,
      locations,
      salaryMin,
      salaryMax,
      status,
      startDate,
      deadline,
      notes,
      responsibilities,
      requirements,
      benefits,
      teamMembers,
      autoShortlistScore,
      requireResume,
      requireCoverLetter,
      requireDrivingLicence,
      requireDBS,
      requireReferences
    } = payload;

    // Validate required fields
    if (!jobTitle || !availability || !experience || !contractType || 
        !locations || locations.length === 0 || !salaryMin || !salaryMax || !deadline) {
      return errorResponseHandler(
        "Missing required fields. Please fill in all required fields.",
        httpStatusCode.BAD_REQUEST,
        res
      );
    }

    // Create new job
    const newJob = new jobModel({
      jobTitle: jobTitle.trim(),
      availability,
      experience,
      contractType,
      locations,
      salaryMin,
      salaryMax,
      status: status || "Draft",
      startDate: startDate || null,
      deadline,
      notes: notes || null,
      responsibilities: responsibilities || [],
      requirements: requirements || [],
      benefits: benefits || [],
      teamMembers: teamMembers || [],
      autoShortlistScore: autoShortlistScore || 75,
      requireResume: requireResume !== undefined ? requireResume : true,
      requireCoverLetter: requireCoverLetter || false,
      requireDrivingLicence: requireDrivingLicence || false,
      requireDBS: requireDBS !== undefined ? requireDBS : true,
      requireReferences: requireReferences !== undefined ? requireReferences : true,
      createdBy: userId
    });

    await newJob.save();

    return {
      success: true,
      message: status === "Open" ? "Job published successfully!" : "Draft saved successfully!",
      data: newJob
    };
  } catch (error: any) {
    console.error("Create job error:", error);
    return errorResponseHandler(
      error.message || "Failed to create job",
      httpStatusCode.INTERNAL_SERVER_ERROR,
      res
    );
  }
};

// Update job
export const updateJobService = async (id: string, payload: any, res: Response) => {
  try {
    const job = await jobModel.findOne({ _id: id, isDeleted: false });
    
    if (!job) {
      return errorResponseHandler("Job not found", httpStatusCode.NOT_FOUND, res);
    }

    const {
      jobTitle,
      availability,
      experience,
      contractType,
      locations,
      salaryMin,
      salaryMax,
      status,
      startDate,
      deadline,
      notes,
      responsibilities,
      requirements,
      benefits,
      teamMembers,
      autoShortlistScore,
      requireResume,
      requireCoverLetter,
      requireDrivingLicence,
      requireDBS,
      requireReferences
    } = payload;

    // Update fields
    if (jobTitle) job.jobTitle = jobTitle.trim();
    if (availability) job.availability = availability;
    if (experience) job.experience = experience;
    if (contractType) job.contractType = contractType;
    if (locations) job.locations = locations;
    if (salaryMin) job.salaryMin = salaryMin;
    if (salaryMax) job.salaryMax = salaryMax;
    if (status) job.status = status;
    if (startDate !== undefined) job.startDate = startDate;
    if (deadline) job.deadline = deadline;
    if (notes !== undefined) job.notes = notes;
    if (responsibilities) job.responsibilities = responsibilities;
    if (requirements) job.requirements = requirements;
    if (benefits) job.benefits = benefits;
    if (teamMembers) job.teamMembers = teamMembers;
    if (autoShortlistScore !== undefined) job.autoShortlistScore = autoShortlistScore;
    if (requireResume !== undefined) job.requireResume = requireResume;
    if (requireCoverLetter !== undefined) job.requireCoverLetter = requireCoverLetter;
    if (requireDrivingLicence !== undefined) job.requireDrivingLicence = requireDrivingLicence;
    if (requireDBS !== undefined) job.requireDBS = requireDBS;
    if (requireReferences !== undefined) job.requireReferences = requireReferences;

    // If status changed to Open, set publishedAt
    if (status === "Open" && job.status !== "Open") {
      job.publishedAt = new Date();
    }

    await job.save();

    return {
      success: true,
      message: "Job updated successfully",
      data: job
    };
  } catch (error: any) {
    console.error("Update job error:", error);
    return errorResponseHandler(
      error.message || "Failed to update job",
      httpStatusCode.INTERNAL_SERVER_ERROR,
      res
    );
  }
};

// Delete job (soft delete)
export const deleteJobService = async (id: string, res: Response) => {
  try {
    const job = await jobModel.findOne({ _id: id, isDeleted: false });
    
    if (!job) {
      return errorResponseHandler("Job not found", httpStatusCode.NOT_FOUND, res);
    }

    // Soft delete
    job.isDeleted = true;
    job.status = "Archived";
    await job.save();

    return {
      success: true,
      message: "Job deleted successfully",
      data: job
    };
  } catch (error: any) {
    return errorResponseHandler(
      error.message || "Failed to delete job",
      httpStatusCode.INTERNAL_SERVER_ERROR,
      res
    );
  }
};

// Publish job
export const publishJobService = async (id: string, res: Response) => {
  try {
    const job = await jobModel.findOne({ _id: id, isDeleted: false });
    
    if (!job) {
      return errorResponseHandler("Job not found", httpStatusCode.NOT_FOUND, res);
    }

    // Check if all required fields are filled
    const requiredFields = [
      job.jobTitle,
      job.availability,
      job.experience,
      job.contractType,
      job.locations && job.locations.length > 0,
      job.salaryMin,
      job.salaryMax,
      job.deadline,
      job.notes,
      job.responsibilities && job.responsibilities.length > 0,
      job.requirements && job.requirements.length > 0,
      job.teamMembers && job.teamMembers.length > 0
    ];

    const missingFields = requiredFields.filter(field => !field);
    
    if (missingFields.length > 0) {
      return errorResponseHandler(
        "Cannot publish job. Please fill in all required fields.",
        httpStatusCode.BAD_REQUEST,
        res
      );
    }

    job.status = "Open";
    job.publishedAt = new Date();
    await job.save();

    return {
      success: true,
      message: "Job published successfully!",
      data: job
    };
  } catch (error: any) {
    return errorResponseHandler(
      error.message || "Failed to publish job",
      httpStatusCode.INTERNAL_SERVER_ERROR,
      res
    );
  }
};

// Get job statistics
export const getJobStatsService = async () => {
  try {
    const total = await jobModel.countDocuments({ isDeleted: false });
    const open = await jobModel.countDocuments({ isDeleted: false, status: "Open" });
    const draft = await jobModel.countDocuments({ isDeleted: false, status: "Draft" });
    const closed = await jobModel.countDocuments({ isDeleted: false, status: "Closed" });
    const paused = await jobModel.countDocuments({ isDeleted: false, status: "Paused" });

    return {
      success: true,
      data: {
        total,
        open,
        draft,
        closed,
        paused
      }
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to fetch job statistics",
      data: null
    };
  }
};
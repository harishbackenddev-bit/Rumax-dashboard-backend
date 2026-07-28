import { Response } from "express";
import { httpStatusCode } from "../../lib/constant";
import { errorResponseHandler } from "../../lib/errors/error-response-handler";
import { candidateModel, ICandidate } from "../../models/candidate/candidate-schema";
import jwt from 'jsonwebtoken';
import { applicationModel } from "../../models/job/application-schema";

// Get all candidates with pagination and filtering
export const getAllCandidatesService = async (payload: any) => {
  try {
    const page = parseInt(payload.page as string) || 1;
    const limit = parseInt(payload.limit as string) || 10;
    const skip = (page - 1) * limit;

    const query: any = { isDeleted: false };

    if (payload.status) query.status = payload.status;
    if (payload.role) query.role = { $regex: payload.role, $options: "i" };
    if (payload.location) query.location = { $regex: payload.location, $options: "i" };
    if (payload.availability) query.availability = payload.availability;
    
    if (payload.search) {
      query.$or = [
        { name: { $regex: payload.search, $options: "i" } },
        { email: { $regex: payload.search, $options: "i" } },
        { role: { $regex: payload.search, $options: "i" } }
      ];
    }

    const sort: any = {};
    const sortField = payload.sortBy || "appliedDate";
    const sortOrder = payload.sortOrder === "asc" ? 1 : -1;
    sort[sortField] = sortOrder;

    const totalDataCount = await candidateModel.countDocuments(query);
    const results = await candidateModel.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select("-__v");

    const formattedResults = results.map(candidate => ({
      ...candidate.toObject(),
      appliedDate: candidate.appliedDate ? new Date(candidate.appliedDate).toISOString().split('T')[0] : null,
      createdAt: candidate.createdAt ? new Date(candidate.createdAt).toISOString().split('T')[0] : null
    }));

    return {
      page,
      limit,
      success: true,
      total: totalDataCount,
      data: formattedResults
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to fetch candidates",
      data: [],
      total: 0,
      page: 1,
      limit: 10
    };
  }
};

// Get candidate by ID
export const getCandidateService = async (id: string, res: Response) => {
  try {
    const candidate = await candidateModel.findOne({ _id: id, isDeleted: false }).select("-__v");

    if (!candidate) {
      return errorResponseHandler("Candidate not found", httpStatusCode.NOT_FOUND, res);
    }

    return {
      success: true,
      message: "Candidate retrieved successfully",
      data: {
        ...candidate.toObject(),
        appliedDate: candidate.appliedDate ? new Date(candidate.appliedDate).toISOString().split('T')[0] : null
      }
    };
  } catch (error: any) {
    return errorResponseHandler(
      error.message || "Failed to fetch candidate",
      httpStatusCode.INTERNAL_SERVER_ERROR,
      res
    );
  }
};


// Create candidate profile
export const createCandidateService = async (payload: any, res: Response) => {
    try {
        const {
            firstName,
            lastName,
            email,
            phone,
            dateOfBirth,
            addressLine1,
            addressLine2,
            city,
            county,
            postcode,
            nationality,
            rightToWork,
            positionAppliedFor,
            workPreference,
            preferredLocations,
            availabilitySchedule,
            drivingLicense,
            ownVehicle,
            shiftConfirmation,
            education,
            experience,
            training,
            registrations,
            references,
            dbsValid,
            disciplinaryAction,
            unspentConvictions,
            documents,
            drivingLicenceUrl,
            dbsCertificateUrl,
            referencesUrl,
            heardFrom,
            supportingStatement,
            scenarioAnswers,
            coreValues,
            resumeUrl,
            coverLetterUrl,
            name,
            role,
            location,
            address,
            skills,
            exp,
            education: legacyEducation
        } = payload;

        // Check if candidate already exists
        const existingCandidate = await candidateModel.findOne({
            email: email?.toLowerCase().trim(),
            isDeleted: false
        });

        if (existingCandidate) {
            const token = jwt.sign(
                {
                    id: existingCandidate._id,
                    email: existingCandidate.email,
                    phone: existingCandidate.phone,
                },
                process.env.JWT_SECRET as string,
                {
                    expiresIn: "7d",
                }
            );

            return {
                success: true,
                message: "Candidate profile already exists",
                data: {
                    ...existingCandidate.toObject(),
                    token,
                },
            };
        }

        // Create new candidate
        const newCandidate = new candidateModel({
            firstName: firstName || name?.split(' ')[0] || '',
            lastName: lastName || name?.split(' ').slice(1).join(' ') || '',
            email: email?.toLowerCase().trim() || '',
            phone: phone || '',
            dateOfBirth: dateOfBirth || '',
            addressLine1: addressLine1 || address || '',
            addressLine2: addressLine2 || '',
            city: city || '',
            county: county || '',
            postcode: postcode || '',
            nationality: nationality || '',
            rightToWork: rightToWork || 'Other',
            positionAppliedFor: positionAppliedFor || role || '',
            workPreference: workPreference || 'Full Time',
            preferredLocations: preferredLocations || (location ? [location] : []),
            availabilitySchedule: availabilitySchedule || {},
            drivingLicense: drivingLicense || false,
            ownVehicle: ownVehicle || false,
            shiftConfirmation: shiftConfirmation || false,
            education: education || [],
            experience: experience || [],
            training: training || [],
            registrations: registrations || [],
            references: references || [],
            dbsValid: dbsValid !== undefined ? dbsValid : false,
            disciplinaryAction: disciplinaryAction !== undefined ? disciplinaryAction : false,
            unspentConvictions: unspentConvictions !== undefined ? unspentConvictions : false,
            documents: documents || [],
            drivingLicenceUrl: drivingLicenceUrl || '',
            dbsCertificateUrl: dbsCertificateUrl || '',
            referencesUrl: referencesUrl || '',
            heardFrom: heardFrom || '',
            supportingStatement: supportingStatement || '',
            scenarioAnswers: scenarioAnswers || { q1: '', q2: '', q3: '' },
            coreValues: coreValues || ['Compassion', 'Respect', 'Integrity', 'Continuous Learning', 'Excellence'],
            resumeUrl: resumeUrl || '',
            coverLetterUrl: coverLetterUrl || '',
            score: 0,
            isDeleted: false
        });

        await newCandidate.save();

        const token = jwt.sign(
            {
                id: newCandidate._id,
                email: newCandidate.email,
                phone: newCandidate.phone,
            },
            process.env.JWT_SECRET as string,
            {
                expiresIn: "7d",
            }
        );

        return {
            success: true,
            message: "Candidate profile created successfully",
            data: {
                ...newCandidate.toObject(),
                token
            }
        };
    } catch (error: any) {
        console.error("Create candidate error:", error);
        return errorResponseHandler(
            error.message || "Failed to create candidate profile",
            httpStatusCode.INTERNAL_SERVER_ERROR,
            res
        );
    }
};

// Apply for job - creates an application
export const applyForJobService = async (payload: any, res: Response) => {
    try {
        const {
            candidateId,
            jobId,
            jobTitle,
            coverLetter,
            additionalNotes,
            availableFrom,
            expectedSalary,
            noticePeriod,
            jobSnapshot
        } = payload;

        // Check if candidate exists
        const candidate = await candidateModel.findOne({ _id: candidateId, isDeleted: false });
        if (!candidate) {
            return errorResponseHandler("Candidate profile not found", httpStatusCode.NOT_FOUND, res);
        }

        // Validate required fields
        if (!jobId) {
            return errorResponseHandler("Job ID is required", httpStatusCode.BAD_REQUEST, res);
        }
        if (!jobTitle) {
            return errorResponseHandler("Job Title is required", httpStatusCode.BAD_REQUEST, res);
        }

        // Check if already applied
        const existingApplication = await applicationModel.findOne({
            candidateId,
            jobId,
            isDeleted: false
        });

        if (existingApplication) {
            return errorResponseHandler(
                "You have already applied for this position",
                httpStatusCode.NOT_FOUND,
                res
            );
        }

        // Create application
        const newApplication = new applicationModel({
            candidateId,
            jobId,
            jobTitle,
            coverLetter: coverLetter || '',
            additionalNotes: additionalNotes || '',
            availableFrom: availableFrom || '',
            expectedSalary: expectedSalary || '',
            noticePeriod: noticePeriod || '',
            status: 'Pending',
            applicationDate: new Date(),
            jobSnapshot: jobSnapshot || {},
            createdBy: candidateId,
            updatedBy: candidateId
        });

        await newApplication.save();

        return {
            success: true,
            message: "Application submitted successfully",
            data: {
                application: newApplication,
                candidate: candidate
            }
        };
    } catch (error: any) {
        console.error("Apply for job error:", error);
        return errorResponseHandler(
            error.message || "Failed to submit application",
            httpStatusCode.INTERNAL_SERVER_ERROR,
            res
        );
    }
};

// // Update candidate
// export const updateCandidateService = async (id: string, payload: any, res: Response) => {
//   try {
//     const candidate = await candidateModel.findOne({ _id: id, isDeleted: false });

//     if (!candidate) {
//       return errorResponseHandler("Candidate not found", httpStatusCode.NOT_FOUND, res);
//     }

//     const {
//       name,
//       email,
//       phone,
//       role,
//       location,
//       availability,
//       nationality,
//       rightToWork,
//       address,
//       city,
//       country,
//       postcode,
//       dob,
//       skills,
//       experience,
//       education
//     } = payload;

//     if (email && email !== candidate.email) {
//       const existingCandidate = await candidateModel.findOne({
//         email: email.toLowerCase().trim(),
//         _id: { $ne: id },
//         isDeleted: false
//       });

//       if (existingCandidate) {
//         return errorResponseHandler(
//           "Email already in use by another candidate",
//           httpStatusCode.BAD_REQUEST,
//           res
//         );
//       }
//     }

//     if (name) candidate.firstName = name.trim();
//     if (email) candidate.email = email.toLowerCase().trim();
//     if (phone !== undefined) candidate.phone = phone;
//     if (location) candidate.addressLine1 = location.trim();
//     if (availability) candidate.availability = availability;
//     if (nationality !== undefined) candidate.nationality = nationality;
//     if (rightToWork !== undefined) candidate.rightToWork = rightToWork;
//     if (address !== undefined) candidate.address = address;
//     if (city !== undefined) candidate.city = city;
//     if (country !== undefined) candidate.country = country;
//     if (postcode !== undefined) candidate.postcode = postcode;
//     if (dob !== undefined) candidate.dob = dob;
//     if (skills !== undefined) candidate.skills = skills;
//     if (experience !== undefined) candidate.experience = experience;
//     if (education !== undefined) candidate.education = education;

//     await candidate.save();

//     return {
//       success: true,
//       message: "Candidate profile updated successfully",
//       data: {
//         ...candidate.toObject(),
//         appliedDate: candidate.appliedDate ? new Date(candidate.appliedDate).toISOString().split('T')[0] : null
//       }
//     };
//   } catch (error: any) {
//     console.error("Update candidate error:", error);
//     return errorResponseHandler(
//       error.message || "Failed to update candidate profile",
//       httpStatusCode.INTERNAL_SERVER_ERROR,
//       res
//     );
//   }
// };

// Delete candidate (soft delete)
export const deleteCandidateService = async (id: string, res: Response) => {
  try {
    const candidate = await candidateModel.findOne({ _id: id, isDeleted: false });

    if (!candidate) {
      return errorResponseHandler("Candidate not found", httpStatusCode.NOT_FOUND, res);
    }

    candidate.isDeleted = true;
    await candidate.save();

    return {
      success: true,
      message: "Candidate deleted successfully",
      data: candidate
    };
  } catch (error: any) {
    return errorResponseHandler(
      error.message || "Failed to delete candidate",
      httpStatusCode.INTERNAL_SERVER_ERROR,
      res
    );
  }
};

// Update candidate status
export const updateCandidateStatusService = async (id: string, status: string, res: Response) => {
  try {
    const candidate = await candidateModel.findOne({ _id: id, isDeleted: false });

    if (!candidate) {
      return errorResponseHandler("Candidate not found", httpStatusCode.NOT_FOUND, res);
    }

    const validStatuses = ["Active", "In Review", "Interview Scheduled", "Offer Sent", "Hired", "Rejected"];
    if (!validStatuses.includes(status)) {
      return errorResponseHandler(
        "Invalid status. Valid statuses: " + validStatuses.join(", "),
        httpStatusCode.BAD_REQUEST,
        res
      );
    }

    candidate.status = status as any;
    await candidate.save();

    return {
      success: true,
      message: `Candidate status updated to "${status}"`,
      data: {
        ...candidate.toObject(),
        appliedDate: candidate.appliedDate ? new Date(candidate.appliedDate).toISOString().split('T')[0] : null
      }
    };
  } catch (error: any) {
    return errorResponseHandler(
      error.message || "Failed to update candidate status",
      httpStatusCode.INTERNAL_SERVER_ERROR,
      res
    );
  }
};

// Get candidate statistics
export const getCandidateStatsService = async () => {
  try {
    const total = await candidateModel.countDocuments({ isDeleted: false });
    const active = await candidateModel.countDocuments({ isDeleted: false, status: "Active" });
    const inReview = await candidateModel.countDocuments({ isDeleted: false, status: "In Review" });
    const interviewScheduled = await candidateModel.countDocuments({ isDeleted: false, status: "Interview Scheduled" });
    const offerSent = await candidateModel.countDocuments({ isDeleted: false, status: "Offer Sent" });
    const hired = await candidateModel.countDocuments({ isDeleted: false, status: "Hired" });
    const rejected = await candidateModel.countDocuments({ isDeleted: false, status: "Rejected" });

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentApplicants = await candidateModel.countDocuments({
      isDeleted: false,
      appliedDate: { $gte: sevenDaysAgo }
    });

    const avgScoreResult = await candidateModel.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: null, avgScore: { $avg: "$score" } } }
    ]);
    const avgScore = avgScoreResult.length > 0 ? Math.round(avgScoreResult[0].avgScore) : 0;

    return {
      success: true,
      data: {
        total,
        active,
        inReview,
        interviewScheduled,
        offerSent,
        hired,
        rejected,
        recentApplicants,
        avgScore
      }
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to fetch candidate statistics",
      data: null
    };
  }
};
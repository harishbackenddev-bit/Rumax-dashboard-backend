import { Response } from "express";
import { httpStatusCode } from "../../lib/constant";
import { errorResponseHandler } from "../../lib/errors/error-response-handler";
import { candidateModel, ICandidate } from "../../models/candidate/candidate-schema";
import jwt from 'jsonwebtoken';
import { applicationModel } from "../../models/job/application-schema";
import { sendStatusUpdateEmail, sendDocumentRequestEmail } from "../../utils/email-service";
import { deleteFile } from "../../config/multer";
import path from "path";
import fs from "fs";


export const uploadCandidatePhotoService = async (
    candidateId: string,
    file: Express.Multer.File,
    res: Response
) => {
    try {
        console.log('Uploading photo for candidate:', candidateId);
        console.log('File info:', file);

        // Validate candidate ID
        if (!candidateId || candidateId === 'undefined' || candidateId === 'null') {
            // Delete uploaded file
            if (file.path) {
                deleteFile(file.path);
            }
            return errorResponseHandler(
                "Invalid candidate ID",
                httpStatusCode.BAD_REQUEST,
                res
            );
        }

        // Find the candidate
        const candidate = await candidateModel.findOne({
            _id: candidateId,
            isDeleted: false
        });

        if (!candidate) {
            // Delete uploaded file if candidate not found
            if (file.path) {
                deleteFile(file.path);
            }
            return errorResponseHandler(
                "Candidate not found",
                httpStatusCode.NOT_FOUND,
                res
            );
        }

        // If existing photo exists, delete it from public/upload/profile
        if (candidate.photoUrl) {
            const oldPhotoPath = path.join(process.cwd(), "public/uploads/profiles", path.basename(candidate.photoUrl));
            if (fs.existsSync(oldPhotoPath)) {
                deleteFile(oldPhotoPath);
                console.log('Deleted old photo:', oldPhotoPath);
            }
        }

        // Generate the public URL for the uploaded photo
        const photoUrl = `/uploads/profiles/${file.filename}`;
        
        // Update candidate with photo URL
        candidate.photoUrl = photoUrl;
        await candidate.save();

        console.log('Photo uploaded successfully for candidate:', candidateId);

        return {
            success: true,
            message: "Photo uploaded successfully",
            data: {
                photoUrl: photoUrl,
                candidateId: candidate._id,
                fileName: file.filename
            }
        };
    } catch (error: any) {
        console.error("Upload photo service error:", error);
        // Delete uploaded file if error occurs
        if (file && file.path) {
            deleteFile(file.path);
        }
        return errorResponseHandler(
            error.message || "Failed to upload photo",
            httpStatusCode.INTERNAL_SERVER_ERROR,
            res
        );
    }
};

// ============================================
// DELETE PHOTO SERVICE - Fixed
// ============================================

export const deleteCandidatePhotoService = async (candidateId: string, res: Response) => {
    try {
        console.log('Deleting photo for candidate:', candidateId);

        const candidate = await candidateModel.findOne({
            _id: candidateId,
            isDeleted: false
        });

        if (!candidate) {
            return errorResponseHandler(
                "Candidate not found",
                httpStatusCode.NOT_FOUND,
                res
            );
        }

        if (!candidate.photoUrl) {
            return errorResponseHandler(
                "No photo to delete",
                httpStatusCode.BAD_REQUEST,
                res
            );
        }

        // Delete the file from public/upload/profile
        const photoPath = path.join(process.cwd(), "public/uploads/profiles", path.basename(candidate.photoUrl));
        if (fs.existsSync(photoPath)) {
            deleteFile(photoPath);
            console.log('Deleted photo file:', photoPath);
        }

        candidate.photoUrl = null;
        await candidate.save();

        return {
            success: true,
            message: "Photo deleted successfully",
            data: {
                candidateId: candidate._id
            }
        };
    } catch (error: any) {
        console.error("Delete photo error:", error);
        return errorResponseHandler(
            error.message || "Failed to delete photo",
            httpStatusCode.INTERNAL_SERVER_ERROR,
            res
        );
    }
};
// Get all candidates with pagination and filtering
export const getAllCandidatesService = async (payload: any) => {
  try {
    const page = parseInt(payload.page as string) || 1;
    const limit = parseInt(payload.limit as string) || 10;
    const skip = (page - 1) * limit;

    const query: any = { isDeleted: false };

    // Filter by status
    if (payload.status) query.status = payload.status;
    
    // Filter by job ID
    if (payload.jobId) query.jobId = payload.jobId;
    
    // Filter by candidate ID
    if (payload.candidateId) query.candidateId = payload.candidateId;

    // Search across candidate name, email, job title
    if (payload.search) {
      query.$or = [
        { jobTitle: { $regex: payload.search, $options: "i" } },
        { 'candidateDetails.firstName': { $regex: payload.search, $options: "i" } },
        { 'candidateDetails.lastName': { $regex: payload.search, $options: "i" } },
        { 'candidateDetails.email': { $regex: payload.search, $options: "i" } }
      ];
    }

    const sort: any = {};
    const sortField = payload.sortBy || "applicationDate";
    const sortOrder = payload.sortOrder === "asc" ? 1 : -1;
    sort[sortField] = sortOrder;

    // Populate candidate details
    const results = await applicationModel.find(query)
      .populate('candidateId', 'firstName lastName email phone addressLine1 city postcode nationality rightToWork')
      .populate('jobId', 'jobTitle location department status')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select("-__v");

    const totalDataCount = await applicationModel.countDocuments(query);

    const formattedResults = results.map(application => {
      const appObj = application.toObject();
      const candidate = appObj.candidateId || {};
      
      return {
        _id: appObj._id,
        applicationId: appObj._id,
        candidateId: appObj.candidateId?._id || appObj.candidateId,
        jobId: appObj.jobId?._id || appObj.jobId,
        jobTitle: appObj.jobId?.jobTitle || appObj.jobTitle || 'N/A',
        jobDetails: appObj.jobId || null,
        
        // Candidate information
        firstName: candidate.firstName || '',
        lastName: candidate.lastName || '',
        fullName: `${candidate.firstName || ''} ${candidate.lastName || ''}`.trim() || 'Unknown',
        email: candidate.email || '',
        phone: candidate.phone || '',
        address: candidate.addressLine1 || '',
        city: candidate.city || '',
        postcode: candidate.postcode || '',
        nationality: candidate.nationality || '',
        rightToWork: candidate.rightToWork || '',
        
        // Application details
        status: appObj.status || 'Pending',
        score: appObj.score || 0,
        applicationDate: appObj.applicationDate || appObj.createdAt,
        coverLetter: appObj.coverLetter || '',
        additionalNotes: appObj.additionalNotes || '',
        availableFrom: appObj.availableFrom || '',
        expectedSalary: appObj.expectedSalary || '',
        noticePeriod: appObj.noticePeriod || '',
        interviewDate: appObj.interviewDate || null,
        interviewNotes: appObj.interviewNotes || '',
        interviewers: appObj.interviewers || [],
        offerDetails: appObj.offerDetails || {},
        rejectionReason: appObj.rejectionReason || '',
        rejectionNotes: appObj.rejectionNotes || '',
        jobSnapshot: appObj.jobSnapshot || {},
        
        createdAt: appObj.createdAt,
        updatedAt: appObj.updatedAt
      };
    });

    return {
      page,
      limit,
      success: true,
      total: totalDataCount,
      data: formattedResults
    };
  } catch (error: any) {
    console.error('Error fetching applications:', error);
    return {
      success: false,
      message: error.message || "Failed to fetch applications",
      data: [],
      total: 0,
      page: 1,
      limit: 10
    };
  }
};

export const getAllstandbyCandidatesService = async (payload: any) => {
  try {

    // console.log("payload", payload)
    const page = parseInt(payload.page as string) || 1;
    const limit = parseInt(payload.limit as string) || 12;
    const skip = (page - 1) * limit;

    // ============================================
    // BUILD QUERY - ONLY CANDIDATES WITH STATUS 
    // ============================================
    const query: any = {
      isDeleted: false,
    };

    // Base query - include all statuses by default
    // or filter by specific status if provided
    if (payload.status) {
      // If status filter is provided, filter by that specific status
      query.status = payload.status;
    } else {
      // If no status filter, get all candidates with any of these statuses
      query.$or = [
        { status: "Standby" },
        { status: "Deployed" },
        { status: "Available" },
        { status: "Unavailable" }
      ];
    }

    // Additional filters
    if (payload.role) {
      query.role = { $regex: payload.role, $options: "i" };
    }

    if (payload.location) {
      query.location = { $regex: payload.location, $options: "i" };
    }

    // Search filter - handle both search and $or conflicts
    if (payload.search) {
      // If we already have $or for status, we need to combine with search
      if (query.$or) {
        // Combine status $or with search conditions
        const searchConditions = [
          { firstName: { $regex: payload.search, $options: "i" } },
          { lastName: { $regex: payload.search, $options: "i" } },
          { email: { $regex: payload.search, $options: "i" } },
          { role: { $regex: payload.search, $options: "i" } }
        ];
        
        // Use $and to combine both conditions
        query.$and = [
          { $or: query.$or },
          { $or: searchConditions }
        ];
        delete query.$or;
      } else {
        // If no status $or, just add search
        query.$or = [
          { firstName: { $regex: payload.search, $options: "i" } },
          { lastName: { $regex: payload.search, $options: "i" } },
          { email: { $regex: payload.search, $options: "i" } },
          { role: { $regex: payload.search, $options: "i" } }
        ];
      }
    }

    // Sorting
    const sort: any = {};
    const sortField = payload.sortBy || "createdAt";
    const sortOrder = payload.sortOrder === "asc" ? 1 : -1;
    sort[sortField] = sortOrder;

    // Count total documents
    const totalDataCount = await candidateModel.countDocuments(query);

    // Fetch results
    const results = await candidateModel.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select("-__v");

    // Format results
    const formattedResults = results.map(candidate => ({
      _id: candidate._id,
      firstName: candidate.firstName,
      lastName: candidate.lastName,
      fullName: candidate.fullName || `${candidate.firstName} ${candidate.lastName}`.trim(),
      email: candidate.email,
      phone: candidate.phone,
      role: candidate.positionAppliedFor || 'N/A',
      location: candidate.city || 'N/A',
      status: candidate.status || 'Standby',
      standbyStatus: candidate.status || 'Available',
      initials: candidate.initials || getInitials(candidate.firstName, candidate.lastName),
      color: candidate.color || getColor(candidate.fullName || `${candidate.firstName} ${candidate.lastName}`),
      availability: 'Immediate',
      experience: candidate.experience || 'N/A',
      appliedDate: candidate.appliedDate ? new Date(candidate.appliedDate).toISOString().split('T')[0] : null,
      createdAt: candidate.createdAt ? new Date(candidate.createdAt).toISOString().split('T')[0] : null,
      updatedAt: candidate.updatedAt ? new Date(candidate.updatedAt).toISOString().split('T')[0] : null,
      resumeUrl: candidate.resumeUrl,
      photoUrl: candidate.photoUrl,
    }));

    return {
      success: true,
      message: "Standby candidates fetched successfully",
      data: formattedResults,
      pagination: {
        page,
        limit,
        total: totalDataCount,
        totalPages: Math.ceil(totalDataCount / limit)
      }
    };

  } catch (error: any) {
    console.error("Error fetching standby candidates:", error);
    return {
      success: false,
      message: error.message || "Failed to fetch standby candidates",
      data: [],
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
      }
    };
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

const getInitials = (firstName: string, lastName: string): string => {
  if (!firstName && !lastName) return '??';
  const first = firstName?.charAt(0) || '';
  const last = lastName?.charAt(0) || '';
  return (first + last).toUpperCase() || '??';
};

const getColor = (name: string): string => {
  const colors = [
    '#0F4C81', '#27B3C9', '#7C3AED', '#059669',
    '#D97706', '#DC2626', '#2563EB', '#0891B2',
    '#601B80', '#B45309', '#0D9488', '#8B5CF6'
  ];
  if (!name) return colors[0];
  const index = (name.length || 0) % colors.length;
  return colors[index];
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

export const updateCandidateService = async (
  id: string,
  payload: any,
  res: Response
) => {
  try {
    // ============================================
    // FIND APPLICATION / CANDIDATE
    // ============================================

    const candidate = await applicationModel.findOne({
      _id: id,
      isDeleted: false
    });

    if (!candidate) {
      return {
        success: false,
        message: "Candidate application not found",
        statusCode: httpStatusCode.NOT_FOUND
      };
    }


    // ============================================
    // FIND MAIN CANDIDATE RECORD
    // ============================================

    if (!candidate.candidateId) {
      return {
        success: false,
        message: "Candidate ID is missing from application",
        statusCode: httpStatusCode.NOT_FOUND
      };
    }

    const candidatemain = await candidateModel.findOne({
      _id: candidate.candidateId,
      isDeleted: false
    });

    if (!candidatemain) {
      return {
        success: false,
        message: "Main candidate record not found",
        statusCode: httpStatusCode.NOT_FOUND
      };
    }


    // ============================================
    // GET PAYLOAD
    // ============================================

    const {
      status,
      jobId,
      jobTitle,
      rejectionReason,
      rejectionNotes,
      interviewDate,
      interviewTime,
      interviewer,
      interviewFormat,
      documents,
      documentNote,
      requestedDocuments,
      standbyStatus
    } = payload;


    // ============================================
    // VALID STATUSES
    // ============================================

    const validStatuses = [
      "Pending",
      "In Review",
      "Interview Scheduled",
      "Offer Sent",
      "Hired",
      "Rejected",
      "Standby",
      "Document Requested",
      "Deployed",
      "Unavailable",
      "Available"
    ];


    if (!status || !validStatuses.includes(status)) {
      return {
        success: false,
        message: "Invalid status provided",
        statusCode: httpStatusCode.BAD_REQUEST
      };
    }


    // ============================================
    // OLD STATUS
    // ============================================

    const oldStatus = candidate.status || "Pending";


    // ============================================
    // UPDATE APPLICATION STATUS
    // ============================================

    candidate.status = status;


    // ============================================
    // CURRENT JOB INFORMATION
    // ============================================

    if (jobId !== undefined && jobId !== null) {
      candidate.currentJobId = jobId;
    }

    if (jobTitle !== undefined && jobTitle !== null) {
      candidate.currentJobTitle = jobTitle;
    }


    // ============================================
    // STATUS SPECIFIC UPDATES
    // ============================================

    switch (status) {

      case "Rejected":

        candidate.rejectionReason =
          rejectionReason || "";

        candidate.rejectionNotes =
          rejectionNotes || "";

        candidate.rejectedAt = new Date();

        break;


      case "Interview Scheduled":

        candidate.interviewDate =
          interviewDate || "";

        candidate.interviewTime =
          interviewTime || "";

        candidate.interviewer =
          interviewer || "";

        candidate.interviewFormat =
          interviewFormat || "Video Call (Teams)";

        candidate.interviewScheduledAt =
          new Date();

        break;


      case "Offer Sent":

        candidate.offerSentAt =
          new Date();

        break;


      case "Hired":

        candidate.hiredAt =
          new Date();

        break;


      case "Document Requested":

        candidate.requestedDocuments =
          requestedDocuments ||
          documents ||
          [];

        candidate.documentRequestNote =
          documentNote || "";

        candidate.documentRequestedAt =
          new Date();

        break;


      case "Deployed":
      case "Unavailable":
      case "Available":

        candidate.status = status;

        candidatemain.status = status;

        break;


      case "Standby":

        candidate.status = "Standby";

        candidatemain.status = "Standby";

        break;


      case "Pending":
      case "In Review":

        candidate.status = status;

        candidatemain.status = status;

        break;
    }


    // ============================================
    // SAVE APPLICATION
    // ============================================

    await candidate.save();


    // ============================================
    // UPDATE MAIN CANDIDATE
    // ============================================

    candidatemain.status = status;

    await candidatemain.save();


    // ============================================
    // EMAIL SETTINGS
    // ============================================

    const noEmailStatuses = [
      "Deployed",
      "Unavailable",
      "Available"
    ];

    const shouldSendEmail =
      !noEmailStatuses.includes(status);


    let emailSent = false;
    let documentEmailSent = false;


    // ============================================
    // SEND STATUS EMAIL
    // ============================================

    if (shouldSendEmail) {

      const candidateEmail =
        candidate.email ||
        candidatemain.email;


      const candidateName =
        candidate.firstName ||
        candidatemain.firstName ||
        "";


      const currentJobTitle =
        jobTitle ||
        candidate.currentJobTitle ||
        candidatemain.positionAppliedFor ||
        "position";


      // --------------------------------------------
      // IMPORTANT:
      // Make sure recipient exists
      // --------------------------------------------

      if (!candidateEmail) {

        console.error(
          "Status email not sent: Candidate email not found",
          {
            applicationId: candidate._id,
            candidateId: candidate.candidateId
          }
        );

      } else {

        const emailData = {

          // IMPORTANT
          candidateEmail: candidateEmail,

          candidateName: candidateName,

          status: status,

          jobTitle: currentJobTitle,

          oldStatus: oldStatus,

          rejectionReason:
            rejectionReason ||
            candidate.rejectionReason ||
            null,

          interviewDetails:
            status === "Interview Scheduled"
              ? {
                  date:
                    interviewDate ||
                    candidate.interviewDate ||
                    "",

                  time:
                    interviewTime ||
                    candidate.interviewTime ||
                    "",

                  interviewer:
                    interviewer ||
                    candidate.interviewer ||
                    "",

                  format:
                    interviewFormat ||
                    candidate.interviewFormat ||
                    "Video Call (Teams)"
                }
              : null
        };


        try {

          await sendStatusUpdateEmail(
            emailData
          );

          emailSent = true;

          console.log(
            `Status update email sent to ${candidateEmail} for status: ${status}`
          );

        } catch (emailError) {

          console.error(
            "Status update email failed:",
            emailError
          );

        }


        // ========================================
        // DOCUMENT REQUEST EMAIL
        // ========================================

        if (
          status === "Document Requested" &&
          (
            requestedDocuments ||
            documents ||
            candidate.requestedDocuments?.length
          )
        ) {

          const documentList =
            requestedDocuments ||
            documents ||
            candidate.requestedDocuments ||
            [];


          const docRequestData = {

            candidateEmail:
              candidateEmail,

            candidateName:
              candidateName,

            documents:
              documentList,

            note:
              documentNote ||
              candidate.documentRequestNote ||
              "",

            jobTitle:
              currentJobTitle
          };


          try {

            await sendDocumentRequestEmail(
              docRequestData
            );

            documentEmailSent = true;

            console.log(
              `Document request email sent to ${candidateEmail}`
            );

          } catch (docEmailError) {

            console.error(
              "Document request email failed:",
              docEmailError
            );

          }

        }

      }

    } else {

      console.log(
        `No email sent for status: ${status} (candidate: ${candidate.email})`
      );

    }


    // ============================================
    // RETURN RESPONSE
    // ============================================

    return {

      success: true,

      message:
        `Candidate status updated to "${status}" successfully`,

      statusCode:
        httpStatusCode.OK,

      data: {

        id:
          candidate._id,

        candidateId:
          candidate.candidateId,

        firstName:
          candidate.firstName ||
          candidatemain.firstName,

        lastName:
          candidate.lastName ||
          candidatemain.lastName,

        email:
          candidate.email ||
          candidatemain.email,

        status:
          candidate.status,

        oldStatus:
          oldStatus,

        currentJobId:
          candidate.currentJobId,

        currentJobTitle:
          candidate.currentJobTitle,

        standbyStatus:
          candidate.status,

        updatedAt:
          candidate.updatedAt,

        emailSent:
          emailSent,

        documentEmailSent:
          documentEmailSent

      }

    };


  } catch (error: any) {

    console.error(
      "Update candidate status error:",
      error
    );

    return {

      success: false,

      message:
        error.message ||
        "Failed to update candidate status",

      statusCode:
        httpStatusCode.INTERNAL_SERVER_ERROR

    };

  }
};




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

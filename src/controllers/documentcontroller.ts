// controllers/document.controller.ts
import { Request, Response } from "express";
import path from "path";
import fs from "fs";

// ============ PROFILE IMAGE UPLOAD ============
export const profileUpdate = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    // Get the file URL (relative path from public directory)
    const imageUrl = `/uploads/profiles/${req.file.filename}`;

    res.status(200).json({
      success: true,
      message: 'Profile image uploaded successfully',
      data: {
        imageUrl: imageUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
      },
    });
  } catch (error: any) {
    console.error('Profile upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload profile image',
      error: error.message,
    });
  }
};

// ============ DOCUMENT UPLOAD ============
export const documentUpload = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    const fileUrl = `/uploads/documents/${req.file.filename}`;

    res.status(200).json({
      success: true,
      message: 'Document uploaded successfully',
      data: {
        url: fileUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
      },
    });
  } catch (error: any) {
    console.error('Document upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload document',
      error: error.message,
    });
  }
};

// ============ MULTIPLE DOCUMENTS UPLOAD ============
export const multipleDocumentsUpload = async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded',
      });
    }

    const uploadedFiles = files.map(file => ({
      url: `/uploads/documents/${file.filename}`,
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
    }));

    res.status(200).json({
      success: true,
      message: `${files.length} document(s) uploaded successfully`,
      data: {
        files: uploadedFiles,
        count: files.length,
      },
    });
  } catch (error: any) {
    console.error('Multiple documents upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload documents',
      error: error.message,
    });
  }
};

// ============ CERTIFICATE UPLOAD ============
export const certificateUpload = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No certificate file uploaded',
      });
    }

    const fileUrl = `/uploads/certificates/${req.file.filename}`;

    res.status(200).json({
      success: true,
      message: 'Certificate uploaded successfully',
      data: {
        url: fileUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
      },
    });
  } catch (error: any) {
    console.error('Certificate upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload certificate',
      error: error.message,
    });
  }
};

// ============ DELETE DOCUMENT ============
export const deleteDocument = async (req: Request, res: Response) => {
  try {
    const { filePath } = req.body;
    
    if (!filePath) {
      return res.status(400).json({
        success: false,
        message: 'File path is required',
      });
    }

    // Remove leading slash if present
    const cleanPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
    const fullPath = path.join(__dirname, '..', cleanPath);

    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found',
      });
    }

    // Delete the file
    fs.unlinkSync(fullPath);

    res.status(200).json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete file',
      error: error.message,
    });
  }
};
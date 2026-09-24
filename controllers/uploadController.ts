import type { Request, Response } from 'express';
import { uploadToCloudinary, uploadMultipleToCloudinary } from '../services/uploadService.ts';
import { errorResponse, successResponse } from '../utils/responses.ts';
import codes from '../utils/statusCodes.ts';

// @desc    Upload a single file (image or video) and return its URL
// @route   POST /api/upload
// @access  Private
export const uploadFile = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        if (!req.file) {
            return errorResponse(res, codes.BAD_REQUEST, 'No file provided.');
        }

        const result = await uploadToCloudinary(req.file.buffer);
        
        return successResponse(res, codes.OK, 'Upload successful.', {
            url: result.secure_url,
            format: result.format,
            resourceType: result.resource_type
        });
    } catch (error: any) {
        const statusCode = error.statusCode || codes.INTERNAL_SERVER_ERROR;
        const message = error.message || 'An error occurred during file upload.';
        return errorResponse(res, statusCode, message);
    }
};

// @desc    Upload multiple files (images and/or videos) and return their URLs
// @route   POST /api/upload/multiple
// @access  Private
export const uploadMultipleFiles = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const files = req.files as Express.Multer.File[];

        if (!files || files.length === 0) {
            return errorResponse(res, codes.BAD_REQUEST, 'No files provided.');
        }

        const results = await uploadMultipleToCloudinary(files);
        const fileData = results.map((result) => ({
            url: result.secure_url,
            format: result.format,
            resourceType: result.resource_type
        }));

        return successResponse(res, codes.OK, 'Multiple upload successful.', fileData);
    } catch (error: any) {
        const statusCode = error.statusCode || codes.INTERNAL_SERVER_ERROR;
        const message = error.message || 'An error occurred during multiple file uploads.';
        return errorResponse(res, statusCode, message);
    }
};
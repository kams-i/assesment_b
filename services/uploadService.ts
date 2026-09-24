import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import type { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import streamifier from 'streamifier';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

// Configure cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer storage with a higher file size limit to accommodate videos (e.g., 50MB)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB
    },
    fileFilter: (_req, file, cb) => {
        // Fallback array for extensions like .jfif, .webp, etc., which might send generic or non-standard mimetypes
        const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.jfif', '.mp4', '.mov', '.mkv', '.avi'];
        const ext = path.extname(file.originalname).toLowerCase();

        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg', 'video/mp4', 'video/quicktime', 'video/mkv'];
        
        const isAllowedMime = file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/') || allowedMimeTypes.includes(file.mimetype);
        const isAllowedExt = allowedExtensions.includes(ext);

        if (isAllowedMime || isAllowedExt) {
            cb(null, true);
        } else {
            cb(new Error(`Only image and video files are allowed! Received mimetype: ${file.mimetype}, extension: ${ext}`));
        }
    }
});

/**
 * Upload a single file (image or video) buffer to Cloudinary
 */
export const uploadToCloudinary = (buffer: Buffer): Promise<UploadApiResponse> => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { 
                folder: 'posts',
                resource_type: 'auto' // Automatically detect if it's an image or video
            },
            (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
                if (result) {
                    resolve(result);
                } else {
                    reject(error);
                }
            }
        );
        streamifier.createReadStream(buffer).pipe(uploadStream);
    });
};

/**
 * Upload multiple files (images and/or videos) buffers to Cloudinary concurrently
 */
export const uploadMultipleToCloudinary = async (files: Express.Multer.File[]): Promise<UploadApiResponse[]> => {
    const uploadPromises = files.map((file) => uploadToCloudinary(file.buffer));
    return Promise.all(uploadPromises);
};

export default upload;
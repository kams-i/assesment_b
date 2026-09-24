import { Router } from 'express';
import { uploadFile, uploadMultipleFiles } from '../controllers/uploadController.ts';
import upload from '../services/uploadService.ts';
import { authenticate } from '../middleware/authMiddleware.ts';

const router = Router();

// Route for uploading a single file (image or video)
router.post('/', authenticate, upload.single('file'), uploadFile);

// Route for uploading multiple files (images and/or videos)
router.post('/multiple', authenticate, upload.array('files', 10), uploadMultipleFiles); // Max 10 files at once

export default router;
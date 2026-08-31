// controllers/commentController.ts
import type { Response } from 'express';
import type { AuthenticatedRequest } from '../middleware/authMiddleware.ts';
import { 
    createCommentService, 
    getCommentsByPostService, 
    deleteCommentService 
} from '../services/commentService.ts';
import {successResponse} from '../utils/responses.ts';
import {errorResponse} from '../utils/responses.ts';
import codes from '../utils/statusCodes.ts';

export const createComment = async (req: AuthenticatedRequest, res: Response): Promise<Response | void> => {
    try {
        const postId = Number(req.params.postId);
        if (isNaN(postId)) {
            return errorResponse(res, codes.BAD_REQUEST, 'Invalid post ID provided.');
        }

        const comment = await createCommentService(req.body, postId, req.user?.id);
        return successResponse(res, codes.CREATED, 'Comment created successfully.', comment);
    } catch (error: any) {
        const statusCode = error.statusCode || codes.BAD_REQUEST;
        const message = error.message || 'An error has occurred.';
        return errorResponse(res, statusCode, message);
    }
};

export const getCommentsByPost = async (req: AuthenticatedRequest, res: Response): Promise<Response | void> => {
    try {
        const postId = Number(req.params.postId);
        if (isNaN(postId)) {
            return errorResponse(res, codes.BAD_REQUEST, 'Invalid post ID provided.');
        }

        const comments = await getCommentsByPostService(postId);
        return successResponse(res, codes.OK, 'Comments retrieved successfully.', comments);
    } catch (error: any) {
        const statusCode = error.statusCode || codes.BAD_REQUEST;
        const message = error.message || 'An error has occurred.';
        return errorResponse(res, statusCode, message);
    }
};

export const deleteComment = async (req: AuthenticatedRequest, res: Response): Promise<Response | void> => {
    try {
        const commentId = Number(req.params.id);
        if (isNaN(commentId)) {
            return errorResponse(res, codes.BAD_REQUEST, 'Invalid comment ID provided.');
        }

        const deletedComment = await deleteCommentService(commentId, req.user?.id, req.user?.role);
        return successResponse(res, codes.OK, 'Comment deleted successfully.', deletedComment);
    } catch (error: any) {
        const statusCode = error.statusCode || codes.BAD_REQUEST;
        const message = error.message || 'An error has occurred.';
        return errorResponse(res, statusCode, message);
    }
};
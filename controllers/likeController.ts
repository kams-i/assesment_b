// controllers/likeController.ts
import type { Response } from 'express';
import type { AuthenticatedRequest } from '../middleware/authMiddleware.ts';
import { toggleLikeService, getUserLikesService } from '../services/likeService.ts';
import { successResponse } from '../utils/responses.ts';
import { errorResponse } from '../utils/responses.ts';
import codes from '../utils/statusCodes.ts';

export const toggleLike = async (req: AuthenticatedRequest, res: Response): Promise<Response | void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return errorResponse(res, codes.UNAUTHORIZED, 'User not authenticated.');
        }

        const rawTargetType = req.params.targetType;
        const rawTargetId = req.params.targetId;

        const targetType = Array.isArray(rawTargetType) ? rawTargetType[0] : rawTargetType;
        const targetId = Array.isArray(rawTargetId) ? rawTargetId[0] : rawTargetId;

        if (!targetType || !['post', 'comment'].includes(targetType)) {
            return errorResponse(res, codes.BAD_REQUEST, 'Invalid target type. Must be "post" or "comment".');
        }

        const numericTargetId = Number(targetId);
        if (isNaN(numericTargetId)) {
            return errorResponse(res, codes.BAD_REQUEST, 'Invalid target ID.');
        }

        const result = await toggleLikeService(Number(userId), targetType as 'post' | 'comment', numericTargetId);
        return successResponse(res, codes.OK, result.message, { liked: result.liked });
    } catch (error: any) {
        const statusCode = error.statusCode || codes.BAD_REQUEST;
        const message = error.message || 'An error has occurred.';
        return errorResponse(res, statusCode, message);
    }
};

export const getUserLikes = async (req: AuthenticatedRequest, res: Response): Promise<Response | void> => {
    try {
        const userId = Number(req.params.userId);
        if (isNaN(userId)) {
            return errorResponse(res, codes.BAD_REQUEST, 'Invalid user ID.');
        }

        const likes = await getUserLikesService(userId);
        return successResponse(res, codes.OK, 'User likes retrieved successfully', likes);
    } catch (error: any) {
        return errorResponse(res, error.statusCode || codes.BAD_REQUEST, error.message);
    }
};
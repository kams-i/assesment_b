// controllers/messageController.ts
import type { Response } from 'express';
import type { AuthenticatedRequest } from '../middleware/authMiddleware.ts';
import { 
    sendMessageService, 
    getConversationService, 
    deleteMessageService,
    getConversationContactsService,
    getAllUsersService
} from '../services/messageService.ts';
import { successResponse, errorResponse } from '../utils/responses.ts';
import codes from '../utils/statusCodes.ts';

export const sendMessage = async (req: AuthenticatedRequest, res: Response): Promise<Response | void> => {
    try {
        const message = await sendMessageService(req.body, req.user?.id);
        return successResponse(res, codes.CREATED, 'Message sent successfully.', message);
    } catch (error: any) {
        const statusCode = error.statusCode || codes.BAD_REQUEST;
        const message = error.message || 'An error has occurred.';
        return errorResponse(res, statusCode, message);
    }
};

export const getConversation = async (req: AuthenticatedRequest, res: Response): Promise<Response | void> => {
    try {
        const otherUserId = Number(req.params.userId);
        if (isNaN(otherUserId)) {
            return errorResponse(res, codes.BAD_REQUEST, 'Invalid user ID provided.');
        }

        const currentUserId = req.user?.id;
        if (!currentUserId) {
            return errorResponse(res, codes.UNAUTHORIZED, 'User not authenticated.');
        }

        const messages = await getConversationService(currentUserId, otherUserId);
        return successResponse(res, codes.OK, 'Conversation retrieved successfully.', messages);
    } catch (error: any) {
        const statusCode = error.statusCode || codes.BAD_REQUEST;
        const message = error.message || 'An error has occurred.';
        return errorResponse(res, statusCode, message);
    }
};

export const deleteMessage = async (req: AuthenticatedRequest, res: Response): Promise<Response | void> => {
    try {
        const messageId = Number(req.params.id);
        if (isNaN(messageId)) {
            return errorResponse(res, codes.BAD_REQUEST, 'Invalid message ID provided.');
        }

        const deletedMessage = await deleteMessageService(messageId, req.user?.id, req.user?.role);
        return successResponse(res, codes.OK, 'Message deleted successfully.', deletedMessage);
    } catch (error: any) {
        const statusCode = error.statusCode || codes.BAD_REQUEST;
        const message = error.message || 'An error has occurred.';
        return errorResponse(res, statusCode, message);
    }
};

export const getContacts = async (req: AuthenticatedRequest, res: Response): Promise<Response | void> => {
    try {
        const currentUserId = req.user?.id;
        if (!currentUserId) {
            return errorResponse(res, codes.UNAUTHORIZED, 'User not authenticated.');
        }

        const users = await getConversationContactsService(currentUserId);
        return successResponse(res, codes.OK, 'Contacts retrieved successfully.', users);
    } catch (error: any) {
        const statusCode = error.statusCode || codes.BAD_REQUEST;
        const message = error.message || 'An error has occurred.';
        return errorResponse(res, statusCode, message);
    }
};

export const getAllUsers = async (req: AuthenticatedRequest, res: Response): Promise<Response | void> => {
    try {
        const currentUserId = req.user?.id;
        if (!currentUserId) {
            return errorResponse(res, codes.UNAUTHORIZED, 'User not authenticated.');
        }

        const users = await getAllUsersService(currentUserId);
        return successResponse(res, codes.OK, 'All users retrieved successfully.', users);
    } catch (error: any) {
        const statusCode = error.statusCode || codes.BAD_REQUEST;
        const message = error.message || 'An error has occurred.';
        return errorResponse(res, statusCode, message);
    }
};
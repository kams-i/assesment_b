import {
    getAllUsersService,
    updateUserService,
    deleteUserService
} from '../services/adminService.ts';
import { errorResponse, successResponse } from '../utils/responses.ts';
import codes from '../utils/statusCodes.ts';
import type { Request, Response } from 'express';

export const getAllUsers = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const users = await getAllUsersService(res);
        if (users) return users;
        return successResponse(res, codes.OK, 'Users fetched successfully.', users);
    } catch (error: unknown) {
        const err = error as { statusCode?: number; message?: string };
        const statusCode = err.statusCode || codes.INTERNAL_SERVER_ERROR;
        const message = err.statusCode ? err.message : 'An error occurred while fetching users.';
        return errorResponse(res, statusCode, message || 'An error occurred while fetching users.');
    }
};

export const updateUser = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const userId = Number(req.params.id);
        if (isNaN(userId)) {
            return errorResponse(res, codes.BAD_REQUEST, 'Invalid user ID provided.');
        }

        const updatedUser = await updateUserService(userId, req.body);
        return successResponse(res, codes.OK, 'User updated successfully.', updatedUser);
    } catch (error: unknown) {
        const err = error as { statusCode?: number; message?: string };
        const statusCode = err.statusCode || codes.INTERNAL_SERVER_ERROR;
        const message = err.statusCode ? err.message : 'An error occurred while updating the user.';
        return errorResponse(res, statusCode, message || 'An error occurred while updating the user.');
    }
};

export const deleteUser = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const userId = Number(req.params.id);
        if (isNaN(userId)) {
            return errorResponse(res, codes.BAD_REQUEST, 'Invalid user ID provided.');
        }

        const deletedUser = await deleteUserService(userId);
        return successResponse(res, codes.OK, 'User deleted successfully.', deletedUser);
    } catch (error: unknown) {
        const err = error as { statusCode?: number; message?: string };
        const statusCode = err.statusCode || codes.INTERNAL_SERVER_ERROR;
        const message = err.message || 'An error occurred while deleting the user.';
        return errorResponse(res, statusCode, message);
    }
};
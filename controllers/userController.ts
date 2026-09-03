import type { Request, Response } from 'express';
import codes from '../utils/statusCodes.ts';
import { errorResponse, successResponse } from '../utils/responses.ts';
import {
    createUser,
    createBulkUsers,
    getAllUsers,
    getOneUser,
    updateUser,
    deleteUser,
    followUser,
    unfollowUser,
    getFollowers,      // Changed from getUserFollowers
    getFollowing,      // Changed from getUserFollowing
} from '../services/userService.ts';

// Extend Express Request to handle custom middleware data like req.normalizedData or user info
export interface CustomRequest extends Request {
    normalizedData?: any;
    user?: {
        id: number;
        [key: string]: any;
    };
}

export async function createUserController(req: Request, res: Response) {
    try {
        const user = await createUser(req.body);
        return successResponse(res, codes.CREATED, 'Successfully created user', user);
    } catch (error) {
        console.error(error);
        const message = error instanceof Error ? error.message : 'The user was not created.';
        return errorResponse(res, codes.BAD_REQUEST, message, error);
    }
}

export async function getAllUsersController(req: Request, res: Response) {
    try {
        const { page, limit } = req.query;

        // Safely coerce query values that might be arrays into single strings or undefined
        const pageStr = Array.isArray(page) ? page[0] : page;
        const limitStr = Array.isArray(limit) ? limit[0] : limit;

        const result = await getAllUsers({
            page: pageStr as string | undefined,
            limit: limitStr as string | undefined,
        });

        if (!result.users || result.users.length === 0) {
            return errorResponse(res, codes.NOT_FOUND, 'No users present in the database.');
        }

        return successResponse(res, codes.OK, 'These are all the users present.', result);
    } catch (error) {
        console.error(error);
        return errorResponse(res, codes.BAD_REQUEST, 'An error has occurred.');
    }
}

export async function getOneUserController(req: Request, res: Response) {
    try {
        // Ensure req.params.id is a single string before parsing
        const idParam = typeof req.params.id === 'string' ? req.params.id : req.params.id[0];
        const userId = parseInt(idParam, 10);
        
        if (isNaN(userId)) {
            return errorResponse(res, codes.BAD_REQUEST, 'A valid numeric ID parameter is required.');
        }

        const user = await getOneUser(userId);
        if (!user) {
            return errorResponse(res, codes.NOT_FOUND, 'User not found.');
        }

        return successResponse(res, codes.OK, 'This is the current user.', user);
    } catch (error) {
        console.error(error);
        return errorResponse(res, codes.INTERNAL_SERVER_ERROR, 'An error has occurred.');
    }
}

export async function updateUserController(req: Request, res: Response) {
    try {
        // Ensure req.params.id is a single string before parsing
        const idParam = typeof req.params.id === 'string' ? req.params.id : req.params.id[0];
        const userId = parseInt(idParam, 10);

        if (isNaN(userId)) {
            return errorResponse(res, codes.BAD_REQUEST, 'A valid numeric ID is required.');
        }

        const updatedUser = await updateUser(userId, req.body);
        if (!updatedUser) {
            return errorResponse(res, codes.NOT_FOUND, 'User not found or no changes made.');
        }

        return successResponse(res, codes.OK, 'The user has been updated.', updatedUser);
    } catch (error) {
        console.error(error);
        return errorResponse(res, codes.INTERNAL_SERVER_ERROR, 'An error has occurred.');
    }
}

export async function deleteUserController(req: Request, res: Response) {
    try {
        // Ensure req.params.id is a single string before parsing
        const idParam = typeof req.params.id === 'string' ? req.params.id : req.params.id[0];
        const userId = parseInt(idParam, 10);

        if (isNaN(userId)) {
            return errorResponse(res, codes.BAD_REQUEST, 'A valid numeric ID is required.');
        }

        const deletedUser = await deleteUser(userId);
        if (!deletedUser) {
            return errorResponse(res, codes.NOT_FOUND, 'User not found or already deleted.');
        }

        return successResponse(res, codes.OK, 'User has successfully been deleted.', deletedUser);
    } catch (error) {
        console.error(error);
        return errorResponse(res, codes.INTERNAL_SERVER_ERROR, 'An error has occurred.');
    }
}

export async function createBulkUserController(req: CustomRequest, res: Response) {
    try {
        // Falls back to req.body if req.normalizedData was not set by middleware
        const rawData = req.normalizedData ?? req.body;
        const userDataArray = Array.isArray(rawData) ? rawData : [rawData];

        const result = await createBulkUsers(userDataArray);

        return successResponse(
            res,
            codes.CREATED,
            `${result.count} user(s) created successfully.`,
            result
        );
    } catch (error: any) {
        console.error('Bulk user creation error:', error);

        let detailedErrors: any = error.message;

        if (error.errors && Array.isArray(error.errors)) {
            detailedErrors = error.errors.map((err: any) => ({
                field: err.path,
                message: err.message,
                value: err.value,
                index: err.instance?._itemIndex ?? undefined,
            }));
        }

        return errorResponse(
            res,
            codes.BAD_REQUEST,
            'Failed to create users. Transaction rolled back.',
            detailedErrors
        );
    }
}

// ==========================================
// FOLLOW & UNFOLLOW CONTROLLERS
// ==========================================

export async function followUserController(req: CustomRequest, res: Response) {
    try {
        const currentUserId = req.user?.id || (req as any).userId;
        if (!currentUserId) {
            return errorResponse(res, codes.UNAUTHORIZED || 401, 'Authentication required.');
        }

        const idParam = typeof req.params.id === 'string' ? req.params.id : req.params.id[0];
        const targetUserId = parseInt(idParam, 10);

        if (isNaN(targetUserId)) {
            return errorResponse(res, codes.BAD_REQUEST, 'A valid target user ID is required.');
        }

        const success = await followUser(currentUserId, targetUserId);
        if (!success) {
            return errorResponse(res, codes.BAD_REQUEST, 'You are already following this user.');
        }

        return successResponse(res, codes.OK, 'Successfully followed user.');
    } catch (error: any) {
        console.error(error);
        return errorResponse(res, codes.BAD_REQUEST, error.message || 'An error has occurred.');
    }
}

export async function unfollowUserController(req: CustomRequest, res: Response) {
    try {
        const currentUserId = req.user?.id || (req as any).userId;
        if (!currentUserId) {
            return errorResponse(res, codes.UNAUTHORIZED || 401, 'Authentication required.');
        }

        const idParam = typeof req.params.id === 'string' ? req.params.id : req.params.id[0];
        const targetUserId = parseInt(idParam, 10);

        if (isNaN(targetUserId)) {
            return errorResponse(res, codes.BAD_REQUEST, 'A valid target user ID is required.');
        }

        const success = await unfollowUser(currentUserId, targetUserId);
        if (!success) {
            return errorResponse(res, codes.BAD_REQUEST, 'You are not following this user.');
        }

        return successResponse(res, codes.OK, 'Successfully unfollowed user.');
    } catch (error: any) {
        console.error(error);
        return errorResponse(res, codes.BAD_REQUEST, error.message || 'An error has occurred.');
    }
}

export async function getFollowersController(req: Request, res: Response) {
    try {
        const idParam = typeof req.params.id === 'string' ? req.params.id : req.params.id[0];
        const userId = parseInt(idParam, 10);

        if (isNaN(userId)) {
            return errorResponse(res, codes.BAD_REQUEST, 'A valid numeric ID is required.');
        }

        const followers = await getFollowers(userId);
        return successResponse(res, codes.OK, 'Followers retrieved successfully.', followers);
    } catch (error: any) {
        console.error(error);
        return errorResponse(res, codes.NOT_FOUND, error.message || 'An error has occurred.');
    }
}

export async function getFollowingController(req: Request, res: Response) {
    try {
        const idParam = typeof req.params.id === 'string' ? req.params.id : req.params.id[0];
        const userId = parseInt(idParam, 10);

        if (isNaN(userId)) {
            return errorResponse(res, codes.BAD_REQUEST, 'A valid numeric ID is required.');
        }

        const following = await getFollowing(userId);
        return successResponse(res, codes.OK, 'Following list retrieved successfully.', following);
    } catch (error: any) {
        console.error(error);
        return errorResponse(res, codes.NOT_FOUND, error.message || 'An error has occurred.');
    }
}
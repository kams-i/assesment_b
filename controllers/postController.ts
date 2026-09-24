import type { Request, Response } from 'express';
import { 
    createPostService, 
    getPostsService, 
    getPostByIdService, 
    deletePostService,
    fetchUserPostsFromDb 
} from '../services/postService.ts';
import { errorResponse, successResponse } from '../utils/responses.ts';
import codes from '../utils/statusCodes.ts';
import { Post } from '../models/index.ts';

interface AuthenticatedRequest extends Request {
    user?: {
        id: number;
        [key: string]: any;
    };
}

export const createPost = async (req: AuthenticatedRequest, res: Response): Promise<Response | void> => {
    try {
        // Flatten req.files whether it's an array, an object of arrays, or single file
        let files: Express.Multer.File[] = [];
        if (Array.isArray(req.files)) {
            files = req.files;
        } else if (req.files && typeof req.files === 'object') {
            files = Object.values(req.files).flat();
        } else if (req.file) {
            files = [req.file];
        }

        const post = await createPostService(req.body, files, req.user?.id);
        return successResponse(res, codes.OK, 'This is the post created.', post);
    } catch (error: any) {
        const statusCode = error.statusCode || codes.BAD_REQUEST;
        const message = error.message || 'An error has occurred.';
        return errorResponse(res, statusCode, message);
    }
};

export const getPosts = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const result = await getPostsService(req.query.page as string, req.query.limit as string);
        return res.status(codes.OK).json(result);
    } catch (error: any) {
        const statusCode = error.statusCode || codes.INTERNAL_SERVER_ERROR;
        const message = error.message || 'An error has occurred.';
        return errorResponse(res, statusCode, message);
    }
};

export const getPostById = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const postId = Number(req.params.id);
        if (isNaN(postId)) {
            return errorResponse(res, codes.BAD_REQUEST, 'Invalid post ID provided.');
        }

        const post = await getPostByIdService(postId);
        return res.status(codes.OK).json(post);
    } catch (error: any) {
        const statusCode = error.statusCode || codes.INTERNAL_SERVER_ERROR;
        const message = error.message || 'An error has occurred.';
        return errorResponse(res, statusCode, message);
    }
};

export const deletePost = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const postId = Number(req.params.id);
        if (isNaN(postId)) {
            return errorResponse(res, codes.BAD_REQUEST, 'Invalid post ID provided.');
        }

        const deletedPost = await deletePostService(postId);
        return successResponse(res, codes.OK, 'Post deleted successfully', deletedPost);
    } catch (error: any) {
        const statusCode = error.statusCode || codes.INTERNAL_SERVER_ERROR;
        const message = error.message || 'An error has occurred.';
        return errorResponse(res, statusCode, message);
    }
};

export const getUserPosts = async (req: Request, res: Response): Promise<Response> => {
    try {
        // Cast req as any to access custom user properties attached by middleware
        const authReq = req as any;
        const userId = authReq.user?.id || authReq.user?.userId || authReq.user?._id;

        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized user" });
        }

        const posts = await fetchUserPostsFromDb(userId);

        return res.status(200).json({
            success: true,
            count: posts.length,
            posts,
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error",
        });
    }
};

export const getUserPostsController = async (req: Request, res: Response) => {
    try {
        const userId = req.params.id || (req as any).user?.id;

        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        const posts = await Post.findAll({
            where: { userId: userId }, // Change 'userId' to 'author' if your foreign key column is named author
            order: [['createdAt', 'DESC']]
        });

        return res.status(200).json({ data: posts });
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
};
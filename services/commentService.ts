// services/commentService.ts
import { Comment, User, Post } from '../models/index.ts';
import codes from '../utils/statusCodes.ts';

export const createCommentService = async (
    body: { content: string },
    postId: number,
    userId?: number
) => {
    if (!userId) {
        const error: any = new Error('User not authenticated.');
        error.statusCode = codes.UNAUTHORIZED;
        throw error;
    }

    const post = await Post.findByPk(postId);
    if (!post) {
        const error: any = new Error('Post not found.');
        error.statusCode = codes.NOT_FOUND;
        throw error;
    }

    const comment = await Comment.create({
        content: body.content,
        postId,
        userId
    });

    const commentWithUser = await Comment.findByPk(comment.id, {
        include: [
            {
                model: User,
                as: 'user',
                attributes: ['id', 'username', 'email', 'firstName', 'lastName']
            }
        ]
    });

    return commentWithUser ? commentWithUser.toJSON() : comment.toJSON();
};

export const getCommentsByPostService = async (postId: number) => {
    const post = await Post.findByPk(postId);
    if (!post) {
        const error: any = new Error('Post not found.');
        error.statusCode = codes.NOT_FOUND;
        throw error;
    }

    const comments = await Comment.findAll({
        where: { postId },
        include: [
            {
                model: User,
                as: 'user',
                attributes: ['id', 'username', 'email', 'firstName', 'lastName']
            }
        ],
        order: [['createdAt', 'DESC']]
    });

    return comments.map(c => c.toJSON());
};

export const deleteCommentService = async (commentId: number, userId?: number, userRole?: string) => {
    const comment = await Comment.findByPk(commentId, {
        include: [
            {
                model: User,
                as: 'user',
                attributes: ['id', 'username', 'email']
            }
        ]
    });

    if (!comment) {
        const error: any = new Error('Comment not found.');
        error.statusCode = codes.NOT_FOUND;
        throw error;
    }

    if (userRole !== 'admin' && comment.userId !== userId) {
        const error: any = new Error('Unauthorized to delete this comment.');
        error.statusCode = codes.FORBIDDEN;
        throw error;
    }

    const commentData = comment.toJSON();
    await comment.destroy();

    return commentData;
};
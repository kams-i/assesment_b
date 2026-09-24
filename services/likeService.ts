// services/likeService.ts
import { Like, Post, Comment, User } from '../models/index.ts';
import codes from '../utils/statusCodes.ts';

export const toggleLikeService = async (
    userId: number,
    targetType: 'post' | 'comment',
    targetId: number
) => {
    const isPost = targetType === 'post';
    
    // Verify target existence
    const target = isPost 
        ? await Post.findByPk(targetId) 
        : await Comment.findByPk(targetId);

    if (!target) {
        const error: any = new Error(`${isPost ? 'Post' : 'Comment'} not found.`);
        error.statusCode = codes.NOT_FOUND;
        throw error;
    }

    const queryCriteria = isPost 
        ? { userId, postId: targetId, commentId: null } 
        : { userId, postId: null, commentId: targetId };

    const existingLike = await Like.findOne({ where: queryCriteria });

    if (existingLike) {
        await existingLike.destroy();
        return { liked: false, message: `${isPost ? 'Post' : 'Comment'} unliked successfully.` };
    } else {
        await Like.create(queryCriteria);
        return { liked: true, message: `${isPost ? 'Post' : 'Comment'} liked successfully.` };
    }
};

// services/likeService.ts
export const getUserLikesService = async (userId: number) => {
    const user = await User.findByPk(userId, {
        attributes: ['id', 'firstName', 'lastName', 'username', 'email']
    });

    if (!user) {
        const error: any = new Error('User not found.');
        error.statusCode = codes.NOT_FOUND;
        throw error;
    }

    const likes = await Like.findAll({
        where: { userId },
        include: [
            {
                model: Post,
                as: 'post',
                required: false,
                attributes: ['id', 'title', 'content', 'images', 'videos', 'createdAt']
            },
            {
                model: Comment,
                as: 'comment',
                required: false,
                attributes: ['id', 'content', 'postId', 'createdAt']
            }
        ],
        order: [['createdAt', 'DESC']]
    });

    // Clean up the response to only show the target that was actually liked
    const formattedLikes = likes.map(like => {
        const plainLike = like.toJSON();
        if (plainLike.postId) {
            delete plainLike.comment;
        } else if (plainLike.commentId) {
            delete plainLike.post;
        }
        return plainLike;
    });

    return {
        user: user.toJSON(),
        likes: formattedLikes
    };
};
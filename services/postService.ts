// services/postService.ts
import { Post, User, Comment, Like } from '../models/index.ts';
import { sequelize } from '../config/database.ts';
import { v2 as cloudinary } from 'cloudinary';
import codes from '../utils/statusCodes.ts';

export const createPostService = async (
    body: { title: string; content: string },
    files?: Express.Multer.File[],
    userId?: number
) => {
    if (!userId) {
        const error: any = new Error('User not authenticated.');
        error.statusCode = codes.UNAUTHORIZED;
        throw error;
    }

    const images: string[] = [];
    const videos: string[] = [];

    if (files && files.length > 0) {
        const uploadPromises = files.map((file) => {
            return new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        resource_type: 'auto',
                        folder: 'posts',
                        timeout: 120000
                    },
                    (error: any, result: any) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                uploadStream.end(file.buffer);
            });
        });

        const results: any = await Promise.all(uploadPromises);

        for (let i = 0; i < results.length; i++) {
            const result = results[i];
            const file = files[i];

            if (result.resource_type === 'video' || (file && file.mimetype.startsWith('video/'))) {
                videos.push(result.secure_url);
            } else {
                images.push(result.secure_url);
            }
        }
    }

    const post = await Post.create({
        title: body.title,
        content: body.content,
        images,
        videos,
        userId
    });

    const postWithDetails = await getPostByIdService(post.id);
    return postWithDetails;
};

export const getPostsService = async (queryPage?: string, queryLimit?: string) => {
    const page = Math.max(1, parseInt(queryPage || '1', 10));
    const limit = Math.max(1, parseInt(queryLimit || '10', 10));
    const offset = (page - 1) * limit;

    const { count: totalPosts, rows: posts } = await Post.findAndCountAll({
        limit,
        offset,
        distinct: true,
        subQuery: false, // Prevents Sequelize from wrapping the query and breaking table references
        include: [
            {
                model: User,
                as: 'user',
                attributes: ['id', 'username', 'email', 'firstName', 'lastName']
            },
            {
                model: Comment,
                as: 'comments',
                include: [
                    {
                        model: User,
                        as: 'user',
                        attributes: ['id', 'username', 'firstName', 'lastName']
                    }
                ]
            }
        ],
        attributes: {
            include: [
                [
                    sequelize.literal(`(
                        SELECT COUNT(*)
                        FROM likes AS l
                        WHERE l.post_id = "Post"."id"
                    )`),
                    'likes'
                ]
            ]
        },
        order: [['createdAt', 'DESC']]
    });

    const totalPages = Math.ceil(totalPosts / limit);

    return {
        posts: posts.map(p => p.toJSON()),
        pagination: {
            totalPosts,
            totalPages,
            currentPage: page,
            limit,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
        }
    };
};

export const getPostByIdService = async (id: number) => {
    const post = await Post.findByPk(id, {
        include: [
            {
                model: User,
                as: 'user',
                attributes: ['id', 'username', 'email']
            },
            {
                model: Comment,
                as: 'comments',
                include: [
                    {
                        model: User,
                        as: 'user',
                        attributes: ['id', 'username']
                    }
                ]
            }
        ],
        attributes: {
            include: [
                [
                    sequelize.literal(`(
                        SELECT COUNT(*)
                        FROM likes AS l
                        WHERE l.post_id = "Post"."id"
                    )`),
                    'likes'
                ]
            ]
        }
    });

    if (!post) {
        const error: any = new Error('Post not found');
        error.statusCode = codes.NOT_FOUND;
        throw error;
    }

    return post.toJSON();
};

export const deletePostService = async (id: number) => {
    const post = await Post.findByPk(id, {
        include: [
            {
                model: User,
                as: 'user',
                attributes: ['id', 'username', 'email']
            }
        ]
    });

    if (!post) {
        const error: any = new Error('Post not found');
        error.statusCode = codes.NOT_FOUND;
        throw error;
    }

    const postData = post.toJSON();
    await post.destroy();

    return postData;
};
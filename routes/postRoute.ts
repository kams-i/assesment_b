import { Router } from 'express';
import { createPost, getPosts, getPostById, deletePost } from '../controllers/postController.ts';
import { createComment, getCommentsByPost, deleteComment } from '../controllers/commentController.ts';
import { authenticate } from '../middleware/authMiddleware.ts';
import upload from '../services/uploadService.ts';

const router = Router();

// Create a post with optional single or multiple files (images/videos)
router.post(
    '/create',
    authenticate,
    upload.fields([
        { name: 'images', maxCount: 10 },
        { name: 'videos', maxCount: 5 }
    ]),
    createPost
);

// Get all posts
router.get('/all', getPosts);

// Get single post by ID
router.get('/:id', getPostById);

// Delete a post
router.delete('/:id', authenticate, deletePost);

// ----------------------------------------------------
// COMMENT ROUTES
// ----------------------------------------------------

// Create a comment on a specific post
router.post('/:postId/comment', authenticate, createComment);

// Get all comments for a specific post
router.get('/:postId/comment', getCommentsByPost);

// Delete a comment by its ID
router.delete('/comment/:id', authenticate, deleteComment);

export default router;
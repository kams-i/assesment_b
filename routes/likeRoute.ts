// routes/likeRoutes.ts
import { Router } from 'express';
import { toggleLike, getUserLikes } from '../controllers/likeController.ts';
import { authenticate } from '../middleware/authMiddleware.ts';

const router = Router();

// Toggle like/unlike on a post or comment
// Example: POST /api/v4/likes/post/1 or POST /api/v4/likes/comment/5
router.post('/:targetType/:targetId', authenticate, toggleLike);

router.get('/user/:userId', getUserLikes);

export default router;
import { 
    createUserController, 
    getAllUsersController, 
    getOneUserController, 
    updateUserController, 
    deleteUserController, 
    createBulkUserController,
    followUserController,
    unfollowUserController,
    getFollowersController,
    getFollowingController,
    getCurrentUserController // <-- Import your controller for /me
} from '../controllers/userController';
import validateUser from '../middleware/validateUser';
import { authenticate } from '../middleware/authMiddleware';
import express from 'express';

const router = express.Router();

// ✅ Add /me route here at the top
router.get('/me', authenticate, getCurrentUserController);

router.post('/create', validateUser, createUserController);
router.post('/bulk', validateUser, createBulkUserController);
router.get('/all', getAllUsersController);
router.get('/one/:id', getOneUserController);
router.put('/update/:id', updateUserController);
router.delete('/delete/:id', deleteUserController);

// Follow / Unfollow require authentication using 'authenticate'
router.post('/:id/follow', authenticate, followUserController);
router.delete('/:id/unfollow', authenticate, unfollowUserController);

// Viewing followers and following can remain public
router.get('/:id/followers', getFollowersController);
router.get('/:id/following', getFollowingController);

export default router;
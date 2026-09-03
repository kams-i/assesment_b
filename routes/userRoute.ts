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
    getFollowingController
} from '../controllers/userController.ts';
import validateUser from '../middleware/validateUser.ts';
import { authenticate } from '../middleware/authMiddleware.ts'; // Uses your actual middleware name
import express from 'express';

const router = express.Router();

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
import { Router } from 'express';
import { 
    getAllUsers, 
    updateUser, 
    deleteUser 
} from '../controllers/adminController.ts';
import { authenticate, authorize } from '../middleware/authMiddleware.ts';

const router = Router();

// Protect all routes with authentication and check that the user role is 'admin'
router.use(authenticate, authorize('admin'));

router.get('/users', getAllUsers);
router.patch('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

export default router;
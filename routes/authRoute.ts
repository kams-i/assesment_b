import express from 'express';
import type { Router } from 'express';
import { 
    signUp, 
    signin, 
    refreshToken, 
    getOneUser, 
    requestOtpController, 
    verifyOtpController 
} from '../controllers/authController.ts';
import { authenticate, authorize } from '../middleware/authMiddleware.ts';
import validateUser from '../middleware/validateUser.ts';

const router: Router = express.Router();

router.post('/signup', validateUser, signUp);
router.post('/signin', signin);
router.post('/refreshtoken', refreshToken);

router.post('/request-otp', requestOtpController);
router.post('/verify-otp', verifyOtpController);

router.get('/me', authenticate, getOneUser);

// Example admin route with authorization check:
// router.get('/admin', authenticate, authorize('admin'), (req, res) => {
//     res.json({ message: 'Admin data', user: (req as any).user });
// });

export default router;
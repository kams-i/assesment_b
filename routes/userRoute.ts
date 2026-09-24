import { 
    createUserController, 
    getAllUsersController, 
    getOneUserController, 
    updateUserController, 
    deleteUserController, 
    createBulkUserController 
} from '../controllers/userController.ts';
import validateUser from '../middleware/validateUser.ts';
import express from 'express';

// Access Router directly from the default express import
const router = express.Router();

router.post('/create', validateUser, createUserController);
router.post('/bulk', validateUser, createBulkUserController);
router.get('/all', getAllUsersController);
router.get('/one/:id', getOneUserController);
router.put('/update/:id', updateUserController);
router.delete('/delete/:id', deleteUserController);

export default router;
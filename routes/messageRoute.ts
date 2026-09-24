// routes/messageRoute.ts
import { Router } from 'express';
import { 
    sendMessage, 
    getConversation, 
    deleteMessage, 
    getContacts, 
    getAllUsers 
} from '../controllers/messageController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

// Get active conversation contacts (people the user has messaged)
router.get('/contacts', authenticate, getContacts);

// Get all users in the system (useful if you want a search/new-chat directory)
router.get('/all-users', authenticate, getAllUsers);

// Send a direct message
router.post('/send', authenticate, sendMessage);

// Get conversation history with a specific user
router.get('/conversation/:userId', authenticate, getConversation);

// Delete a message by its ID
router.delete('/:id', authenticate, deleteMessage);

export default router;
import express from 'express';
import { getMyBookmarks } from '../controllers/bookmarkController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authenticatedUser } from '../middleware/roleMiddleware.js';

const router = express.Router();

// GET /api/bookmarks/my?intent=EXAM
router.get('/my', protect, authenticatedUser, getMyBookmarks);

export default router;
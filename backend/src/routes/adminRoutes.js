import express from 'express';
import { getAllUsers, updateUserStatus, deleteUser, getAdminStats, getAdminSessions } from '../controllers/adminController.js';
import { protect} from '../middleware/authMiddleware.js';
import {adminOnly} from '../middleware/roleMiddleware.js';

const router = express.Router();

// All admin routes require auth + admin role
router.use(protect, adminOnly);

router.get('/users', getAllUsers);
router.patch('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteUser);
router.get('/stats', getAdminStats);
router.get('/sessions', getAdminSessions);

export default router;

import express from 'express';
import { registerLecturer } from '../controllers/lecturerController.js';

const router = express.Router();

// POST /api/lecturers/register
router.post('/register', registerLecturer);

export default router;

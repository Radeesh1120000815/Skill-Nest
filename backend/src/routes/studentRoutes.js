import express from 'express';
import { registerStudent } from '../controllers/studentController.js';

const router = express.Router();

// POST /api/students/register
router.post('/register', registerStudent);

export default router;

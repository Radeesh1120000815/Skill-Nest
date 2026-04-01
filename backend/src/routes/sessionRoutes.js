import express from 'express';
import { createSession, getMySessions, getMyAllSessions, updateSession, deleteSession } from '../controllers/sessionController.js';

const router = express.Router();

// Lecturer creates a new session (uses x-user-id header from frontend)
router.post('/', createSession);

// Get sessions for logged-in lecturer (uses x-user-id header from frontend)
router.get('/my', getMySessions);

// Get all sessions (upcoming + completed) for logged-in lecturer
router.get('/my/all', getMyAllSessions);

// Update a specific session
router.put('/:id', updateSession);

// Delete a specific session
router.delete('/:id', deleteSession);

export default router;

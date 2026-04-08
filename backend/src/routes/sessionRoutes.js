import express from 'express';
import {
  createSession,
  getMySessions,
  getMyAllSessions,
  updateSession,
  deleteSession,
  getAllSessions,
  getSessionById,
} from '../controllers/sessionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// ── All routes require a valid JWT (protect middleware) ───────────────────────
router.use(protect);

// ── Student route ─────────────────────────────────────────────────────────────
router.get('/', getAllSessions);           // GET all active sessions

// ── Lecturer routes ───────────────────────────────────────────────────────────
router.post('/', createSession);           // POST create session
router.get('/my', getMySessions);          // GET upcoming sessions (lecturer's own)
router.get('/my/all', getMyAllSessions);   // GET all sessions (lecturer's own)
router.put('/:id', updateSession);         // PUT update session
router.delete('/:id', deleteSession);      // DELETE session

// ── Shared ────────────────────────────────────────────────────────────────────
router.get('/:id', getSessionById);        // GET single session by ID

export default router;
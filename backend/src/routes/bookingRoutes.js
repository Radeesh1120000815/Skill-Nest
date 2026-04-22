import express from 'express';
import {
  createBooking,
  getMyBookings,
  updateBooking,
  cancelBooking,
  markComplete,
  submitFeedback,
  getLecturerBookings,
  approveBooking,
  rejectBooking,
} from '../controllers/bookingController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require JWT
router.use(protect);

// ── Student ──────────────────────────────────────────────────────────────────
router.post('/',                createBooking);     // create booking
router.get('/my',               getMyBookings);     // get own bookings
router.put('/:id',              updateBooking);     // edit pending booking
router.delete('/:id',           cancelBooking);     // cancel pending booking
router.put('/:id/complete',     markComplete);      // mark complete
router.post('/:id/feedback',    submitFeedback);    // submit feedback

// ── Lecturer ─────────────────────────────────────────────────────────────────
router.get('/lecturer',         getLecturerBookings); // get all bookings for my sessions
router.put('/:id/approve',      approveBooking);      // approve
router.put('/:id/reject',       rejectBooking);       // reject

export default router;

 import Booking from '../models/bookingModel.js';
import Session from '../models/sessionModel.js';
 
// Shared helper — covers main system STUDENT + Kuppi roles
const STUDENT_ROLES = ['STUDENT', 'junior', 'senior', 'both'];
const isStudent = (role) => STUDENT_ROLES.includes(role);
 
// ─────────────────────────────────────────────────────────────────────────────
//  STUDENT ENDPOINTS
// ─────────────────────────────────────────────────────────────────────────────
 
// @desc    Student creates a booking (double-booking prevented by unique index)
// @route   POST /api/bookings
// @access  Private (STUDENT / Kuppi roles)
export const createBooking = async (req, res) => {
  try {
    if (!isStudent(req.user.role)) {
      return res.status(403).json({ message: 'Only students can create bookings.' });
    }
 
    const { sessionId, phone, reason, experience,studentUniversityId } = req.body;

    //phone number validation
    if (!phone || !/^\d{10}$/.test(phone)) {
      return res.status(400).json({ message: 'Phone number must be exactly 10 digits.' });
    }
 
    // 1. Validate session exists and is active
    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ message: 'Session not found.' });
    if (session.status !== 'active') {
      return res.status(400).json({ message: 'This session is not accepting bookings.' });
    }
 
    // 2. Check capacity
    if (session.currentEnrollments >= session.maxStudents) {
      return res.status(400).json({ message: 'This session is fully booked.' });
    }
 
    // 3. Check for existing booking (belt-and-suspenders before unique index fires)
    const existing = await Booking.findOne({ studentId: req.user._id, sessionId });
    if (existing) {
      return res.status(400).json({ message: 'You have already booked this session.' });
    }
 
    const booking = await Booking.create({
      studentId:           req.user._id,
      sessionId,
      lecturerId:          session.lecturer,
      studentName:         req.user.name,
      studentUniversityId: studentUniversityId || req.user.universityId || '',
      studentEmail:        req.user.email,
      phone,
      reason,
      experience: experience || 'beginner',
    });
 
    // 4. Increment enrollment counter on the session
    session.currentEnrollments += 1;
    await session.save();
 
    const populated = await booking.populate(
      'sessionId',
      'title subject lecturerName date time durationMinutes'
    );
    return res.status(201).json({
      message: 'Booking submitted! Awaiting lecturer approval.',
      data: populated,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You have already booked this session.' });
    }
    console.error('Create booking error:', error.message);
    return res.status(500).json({ message: error.message });
  }
};
 
// @desc    Get all bookings for the logged-in student
// @route   GET /api/bookings/my
// @access  Private (STUDENT / Kuppi roles)
export const getMyBookings = async (req, res) => {
  try {
    if (!isStudent(req.user.role)) {
      return res.status(403).json({ message: 'Only students can view their bookings.' });
    }
 
    const bookings = await Booking.find({ studentId: req.user._id })
      .populate(
        'sessionId',
        'title subject lecturerName date time durationMinutes sessionLink tags averageRating status'
      )
      .sort({ createdAt: -1 });
 
    return res.json({ data: bookings });
  } catch (error) {
    console.error('Get my bookings error:', error.message);
    return res.status(500).json({ message: error.message });
  }
};
 
// @desc    Student edits a PENDING booking
// @route   PUT /api/bookings/:id
// @access  Private (STUDENT, own booking, pending status only)
export const updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found.' });
 
    if (booking.studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorised.' });
    }
    if (booking.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending bookings can be edited.' });
    }
 
    const { phone, reason, experience, availability } = req.body;
    if (phone)        booking.phone        = phone;
    if (reason)       booking.reason       = reason;
    if (experience)   booking.experience   = experience;
    
 
    const updated = await booking.save();
 
    // Populate session details for the response
    await updated.populate(
      'sessionId',
      'title subject lecturerName date time durationMinutes'
    );
 
    return res.json({ message: 'Booking updated.', data: updated });
  } catch (error) {
    console.error('Update booking error:', error.message);
    return res.status(500).json({ message: error.message });
  }
};
 
// @desc    Student cancels a PENDING booking
// @route   DELETE /api/bookings/:id
// @access  Private (STUDENT, own booking, pending status only)
export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found.' });
 
    if (booking.studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorised.' });
    }
    if (booking.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending bookings can be cancelled.' });
    }
 
    // Decrement enrollment counter
    await Session.findByIdAndUpdate(booking.sessionId, {
      $inc: { currentEnrollments: -1 },
    });
 
    await booking.deleteOne();
    return res.json({ message: 'Booking cancelled successfully.' });
  } catch (error) {
    console.error('Cancel booking error:', error.message);
    return res.status(500).json({ message: error.message });
  }
};
 
// @desc    Student marks a session as completed
// @route   PUT /api/bookings/:id/complete
// @access  Private (STUDENT, approved booking only)
export const markComplete = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found.' });
 
    if (booking.studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorised.' });
    }
    if (booking.status !== 'approved') {
      return res.status(400).json({ message: 'Session must be approved before marking complete.' });
    }
    if (booking.isCompleted) {
      return res.status(400).json({ message: 'Already marked as completed.' });
    }
 
    booking.isCompleted = true;
    booking.completedAt = new Date();
    await booking.save();
 
    return res.json({ message: 'Session marked as completed! 🎉', data: booking });
  } catch (error) {
    console.error('Mark complete error:', error.message);
    return res.status(500).json({ message: error.message });
  }
};
 
// @desc    Student submits feedback for a completed session
// @route   POST /api/bookings/:id/feedback
// @access  Private (STUDENT, completed booking, no duplicate)
export const submitFeedback = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('sessionId');
    if (!booking) return res.status(404).json({ message: 'Booking not found.' });
 
    if (booking.studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorised.' });
    }
    if (!booking.isCompleted) {
      return res.status(400).json({ message: 'Complete the session before leaving feedback.' });
    }
    if (booking.feedback?.rating) {
      return res.status(400).json({ message: 'You have already submitted feedback.' });
    }
 
    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5.' });
    }
 
    booking.feedback = { rating, comment, submittedAt: new Date() };
    await booking.save();
 
    // ── Recalculate session average rating ────────────────────────────────
    const session = await Session.findById(booking.sessionId._id || booking.sessionId);
    if (session) {
      const allFeedback = await Booking.find({
        sessionId:         session._id,
        'feedback.rating': { $exists: true },
      });
      const totalRatings = allFeedback.length;
      const sum = allFeedback.reduce((acc, b) => acc + (b.feedback?.rating || 0), 0);
      session.averageRating = totalRatings > 0 ? parseFloat((sum / totalRatings).toFixed(1)) : 0;
      session.totalRatings  = totalRatings;
      await session.save();
    }
 
    return res.json({ message: 'Feedback submitted! ⭐', data: booking.feedback });
  } catch (error) {
    console.error('Submit feedback error:', error.message);
    return res.status(500).json({ message: error.message });
  }
};
 
// ─────────────────────────────────────────────────────────────────────────────
//  LECTURER ENDPOINTS
// ─────────────────────────────────────────────────────────────────────────────
 
// @desc    Lecturer gets all bookings across their sessions
// @route   GET /api/bookings/lecturer
// @access  Private (LECTURER)
export const getLecturerBookings = async (req, res) => {
  try {
    if (req.user.role !== 'LECTURER') {
      return res.status(403).json({ message: 'Only lecturers can access this.' });
    }
 
    const bookings = await Booking.find({ lecturerId: req.user._id })
      .populate('sessionId', 'title subject date time')
      .populate('studentId', 'name email')
      .sort({ createdAt: -1 });
 
    return res.json({ data: bookings });
  } catch (error) {
    console.error('Get lecturer bookings error:', error.message);
    return res.status(500).json({ message: error.message });
  }
};
 
// @desc    Lecturer approves a booking
// @route   PUT /api/bookings/:id/approve
// @access  Private (LECTURER)
export const approveBooking = async (req, res) => {
  try {
    if (req.user.role !== 'LECTURER') {
      return res.status(403).json({ message: 'Only lecturers can approve bookings.' });
    }
 
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found.' });
 
    if (booking.lecturerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorised.' });
    }
 
    const sessionLink = String(req.body?.sessionLink || '').trim();

    if (sessionLink) {
      try {
        const parsedUrl = new URL(sessionLink);
        if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
          return res.status(400).json({ message: 'Session link must start with http or https.' });
        }
      } catch {
        return res.status(400).json({ message: 'Please provide a valid video/session link.' });
      }
    }

    booking.status       = 'approved';
    booking.lecturerNote = req.body.note || '';
    await booking.save();

    if (sessionLink) {
      await Session.findByIdAndUpdate(booking.sessionId, { sessionLink });
    }
 
    return res.json({ message: 'Booking approved! ✅', data: booking });
  } catch (error) {
    console.error('Approve booking error:', error.message);
    return res.status(500).json({ message: error.message });
  }
};
 
// @desc    Lecturer rejects a booking
// @route   PUT /api/bookings/:id/reject
// @access  Private (LECTURER)
export const rejectBooking = async (req, res) => {
  try {
    if (req.user.role !== 'LECTURER') {
      return res.status(403).json({ message: 'Only lecturers can reject bookings.' });
    }
 
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found.' });
 
    if (booking.lecturerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorised.' });
    }
 
    booking.status       = 'rejected';
    booking.lecturerNote = req.body.note || '';
    await booking.save();
 
    // Decrement enrollment counter
    await Session.findByIdAndUpdate(booking.sessionId, {
      $inc: { currentEnrollments: -1 },
    });
 
    return res.json({ message: 'Booking rejected.', data: booking });
  } catch (error) {
    console.error('Reject booking error:', error.message);
    return res.status(500).json({ message: error.message });
  }
};


import Session from '../models/sessionModel.js';
import { ensureDbConnection } from '../config/db.js';

// @desc    Create a new session (Lecturer only)
// @route   POST /api/sessions
// @access  Private
export const createSession = async (req, res) => {
  try {
    await ensureDbConnection();

    const lecturerId = req.user?._id || req.headers['x-user-id'];
    if (!lecturerId) {
      // If we can't determine lecturer (e.g. no auth), just return no sessions
      return res.status(200).json([]);
    }

    const {
      title,
      subject,
      maxStudents,
      description,
      date, // ISO string from frontend
      duration,
    } = req.body;

    if (!title || !subject || !maxStudents || !date || !duration) {
      return res.status(400).json({ message: 'Please fill in all required fields' });
    }

    const durationMinutes = Number(duration);

    const session = await Session.create({
      lecturer: lecturerId,
      title,
      subject,
      maxStudents: Number(maxStudents),
      description: description || '',
      date: new Date(date),
      durationMinutes,
    });

    return res.status(201).json({ message: 'Session created successfully', session });
  } catch (error) {
    console.error('Create session error:', error.message);
    return res.status(500).json({ message: 'Server error creating session' });
  }
};

// @desc    Get upcoming sessions for the logged-in lecturer
// @route   GET /api/sessions/my
// @access  Private
export const getMySessions = async (req, res) => {
  try {
    await ensureDbConnection();

    const lecturerId = req.user?._id || req.headers['x-user-id'];
    if (!lecturerId) {
      return res.status(401).json({ message: 'Not authorized: lecturer not found' });
    }

    const now = new Date();
    const sessions = await Session.find({ lecturer: lecturerId, date: { $gte: now } })
      .sort({ date: 1 })
      .lean();

    return res.json(sessions);
  } catch (error) {
    console.error('Get sessions error:', error.message);
    // On any error, fail gracefully with an empty list so the UI stays clean
    return res.status(200).json([]);
  }
};

// @desc    Update an existing session (Lecturer only)
// @route   PUT /api/sessions/:id
// @access  Private
export const updateSession = async (req, res) => {
  try {
    await ensureDbConnection();

    const lecturerId = req.user?._id || req.headers['x-user-id'];
    if (!lecturerId) {
      return res.status(401).json({ message: 'Not authorized: lecturer not found' });
    }

    const { id } = req.params;

    const session = await Session.findOne({ _id: id, lecturer: lecturerId });
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    const { title, subject, maxStudents, description, date, duration } = req.body;

    if (title !== undefined) session.title = title;
    if (subject !== undefined) session.subject = subject;
    if (maxStudents !== undefined) session.maxStudents = Number(maxStudents);
    if (description !== undefined) session.description = description;
    if (date !== undefined) session.date = new Date(date);
    if (duration !== undefined) session.durationMinutes = Number(duration);

    await session.save();

    return res.json({ message: 'Session updated successfully', session });
  } catch (error) {
    console.error('Update session error:', error.message);
    return res.status(500).json({ message: 'Server error updating session' });
  }
};

// @desc    Delete a session (Lecturer only)
// @route   DELETE /api/sessions/:id
// @access  Private
export const deleteSession = async (req, res) => {
  try {
    await ensureDbConnection();

    const lecturerId = req.user?._id || req.headers['x-user-id'];
    if (!lecturerId) {
      return res.status(401).json({ message: 'Not authorized: lecturer not found' });
    }

    const { id } = req.params;

    const session = await Session.findOneAndDelete({ _id: id, lecturer: lecturerId });
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    return res.json({ message: 'Session deleted successfully' });
  } catch (error) {
    console.error('Delete session error:', error.message);
    return res.status(500).json({ message: 'Server error deleting session' });
  }
};

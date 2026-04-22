import Session from '../models/sessionModel.js';

// ─────────────────────────────────────────────────────────────────────────────
//  LECTURER ENDPOINTS
// ─────────────────────────────────────────────────────────────────────────────

// @desc    Create a new session
// @route   POST /api/sessions
// @access  Private (LECTURER only)
export const createSession = async (req, res) => {
  try {
    // ── Role check: uppercase LECTURER ──────────────────────────────────────
    if (req.user.role !== 'LECTURER') {
      return res.status(403).json({ message: 'Only lecturers can create sessions.' });
    }

    const {
      title,
      subject,
      maxStudents,
      description,
      date,
      duration,
      sessionLink,
      time,
      tags,
    } = req.body;

    if (!title || !subject || !maxStudents || !date || !duration) {
      return res.status(400).json({ message: 'Please fill in all required fields.' });
    }

    const sessionPayload = {
      lecturer: req.user._id,
      lecturerName: req.user.name,   // denormalise so student views don't need populate
      title,
      subject,
      maxStudents: Number(maxStudents),
      description: description || '',
      date: new Date(date),
      durationMinutes: Number(duration),
      tags: tags || [],
    };

    if (typeof sessionLink === 'string' && sessionLink.trim()) {
      sessionPayload.sessionLink = sessionLink.trim();
    }
    if (typeof time === 'string' && time.trim()) {
      sessionPayload.time = time.trim();
    }

    const session = await Session.create(sessionPayload);

    return res.status(201).json({ message: 'Session created successfully', session });
  } catch (error) {
    console.error('Create session error:', error.message);
    return res.status(500).json({ message: 'Server error creating session' });
  }
};

// @desc    Get upcoming sessions for the logged-in lecturer
// @route   GET /api/sessions/my
// @access  Private (LECTURER only)
export const getMySessions = async (req, res) => {
  try {
    if (req.user.role !== 'LECTURER') {
      return res.status(403).json({ message: 'Only lecturers can access this.' });
    }

    const now = new Date();
    const sessions = await Session.find({ lecturer: req.user._id, date: { $gte: now } })
      .sort({ date: 1 })
      .lean();

    return res.json(sessions);
  } catch (error) {
    console.error('Get sessions error:', error.message);
    return res.status(200).json([]);
  }
};

// @desc    Get all sessions (upcoming + completed) for the logged-in lecturer
// @route   GET /api/sessions/my/all
// @access  Private (LECTURER only)
export const getMyAllSessions = async (req, res) => {
  try {
    if (req.user.role !== 'LECTURER') {
      return res.status(403).json({ message: 'Only lecturers can access this.' });
    }

    const sessions = await Session.find({ lecturer: req.user._id })
      .sort({ date: -1 })
      .lean();

    return res.json(sessions);
  } catch (error) {
    console.error('Get all sessions error:', error.message);
    return res.status(200).json([]);
  }
};

// @desc    Update an existing session
// @route   PUT /api/sessions/:id
// @access  Private (LECTURER, own session only)
export const updateSession = async (req, res) => {
  try {
    if (req.user.role !== 'LECTURER') {
      return res.status(403).json({ message: 'Only lecturers can update sessions.' });
    }

    const session = await Session.findOne({ _id: req.params.id, lecturer: req.user._id });
    if (!session) {
      return res.status(404).json({ message: 'Session not found.' });
    }

    const { title, subject, maxStudents, description, date, duration, sessionLink, time, tags, status } = req.body;

    if (title !== undefined) session.title = title;
    if (subject !== undefined) session.subject = subject;
    if (maxStudents !== undefined) session.maxStudents = Number(maxStudents);
    if (description !== undefined) session.description = description;
    if (date !== undefined) session.date = new Date(date);
    if (duration !== undefined) session.durationMinutes = Number(duration);
    if (sessionLink !== undefined) {
      const cleanedSessionLink = String(sessionLink || '').trim();
      if (cleanedSessionLink) session.sessionLink = cleanedSessionLink;
      else session.set('sessionLink', undefined);
    }
    if (time !== undefined) {
      const cleanedTime = String(time || '').trim();
      if (cleanedTime) session.time = cleanedTime;
      else session.set('time', undefined);
    }
    if (tags !== undefined) session.tags = tags;
    if (status !== undefined) session.status = status;

    await session.save();
    return res.json({ message: 'Session updated successfully', session });
  } catch (error) {
    console.error('Update session error:', error.message);
    return res.status(500).json({ message: 'Server error updating session' });
  }
};

// @desc    Delete a session
// @route   DELETE /api/sessions/:id
// @access  Private (LECTURER, own session only)
export const deleteSession = async (req, res) => {
  try {
    if (req.user.role !== 'LECTURER') {
      return res.status(403).json({ message: 'Only lecturers can delete sessions.' });
    }

    const session = await Session.findOneAndDelete({ _id: req.params.id, lecturer: req.user._id });
    if (!session) {
      return res.status(404).json({ message: 'Session not found.' });
    }

    return res.json({ message: 'Session deleted successfully.' });
  } catch (error) {
    console.error('Delete session error:', error.message);
    return res.status(500).json({ message: 'Server error deleting session' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  STUDENT ENDPOINT
// ─────────────────────────────────────────────────────────────────────────────

// @desc    Get all active sessions (student dashboard)
// @route   GET /api/sessions
// @access  Private (STUDENT + LECTURER)
export const getAllSessions = async (req, res) => {
  try {
    const sessions = await Session.find({ status: 'active' })
      .sort({ date: 1 })
      .lean();

    return res.json({ data: sessions });
  } catch (error) {
    console.error('Get all sessions error:', error.message);
    return res.status(500).json({ message: 'Server error fetching sessions.' });
  }
};

// @desc    Get single session by ID
// @route   GET /api/sessions/:id
// @access  Private
export const getSessionById = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id).lean();
    if (!session) return res.status(404).json({ message: 'Session not found.' });
    return res.json({ data: session });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

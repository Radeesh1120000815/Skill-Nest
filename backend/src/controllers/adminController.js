import User from '../models/userModel.js';
import Session from '../models/sessionModel.js';
import { ensureDbConnection } from '../config/db.js';

// @desc    Get all users (optionally filter by role)
// @route   GET /api/admin/users
// @access  Admin
export const getAllUsers = async (req, res) => {
  try {
    await ensureDbConnection();

    const { role } = req.query;
    const filter = {};
    if (role && role !== 'all') {
        filter.role = role;
    }

    const users = await User.find(filter)
      .select('-password -resetPasswordToken -resetPasswordExpires')
      .sort({ createdAt: -1 });

    return res.json(users);
  } catch (error) {
    console.error('Admin getAllUsers error:', error.message);
    return res.status(500).json({ message: 'Failed to load users' });
  }
};

// @desc    Update user status (active/blocked)
// @route   PATCH /api/admin/users/:id/status
// @access  Admin
export const updateUserStatus = async (req, res) => {
  try {
    await ensureDbConnection();

    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'blocked'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    ).select('-password -resetPasswordToken -resetPasswordExpires');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({ message: 'User status updated', user });
  } catch (error) {
    console.error('Admin updateUserStatus error:', error.message);
    return res.status(500).json({ message: 'Failed to update user status' });
  }
};

// @desc    Delete a user account
// @route   DELETE /api/admin/users/:id
// @access  Admin
export const deleteUser = async (req, res) => {
  try {
    await ensureDbConnection();

    const { id } = req.params;

    // Optional: prevent an admin from deleting themself
    if (req.user && String(req.user._id) === id) {
      return res.status(400).json({ message: 'You cannot delete your own admin account' });
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Admin deleteUser error:', error.message);
    return res.status(500).json({ message: 'Failed to delete user' });
  }
};

// @desc    Get all upcoming sessions with lecturer details
// @route   GET /api/admin/sessions
// @access  Admin
export const getAdminSessions = async (req, res) => {
  try {
    await ensureDbConnection();

    const now = new Date();

    const sessions = await Session.find({ date: { $gte: now } })
      .populate('lecturer', 'name email role')
      .sort({ date: 1 })
      .lean();

    return res.json(sessions);
  } catch (error) {
    console.error('Admin getAdminSessions error:', error.message);
    return res.status(500).json({ message: 'Failed to load sessions' });
  }
};

// @desc    Get high-level admin stats
// @route   GET /api/admin/stats
 // @access  Admin
export const getAdminStats = async (req, res) => {
  try {
    await ensureDbConnection();

    const now = new Date();

    const [
      totalUsers,
      studentCount,
      lecturerCount,
      adminCount,
      activeUsers,
      blockedUsers,
      activeUpcomingSessions,
    ] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ role: 'STUDENT' }),
      User.countDocuments({ role: 'LECTURER' }),
      User.countDocuments({ role: 'ADMIN' }),
      User.countDocuments({ status: 'active' }),
      User.countDocuments({ status: 'blocked' }),
      Session.countDocuments({ date: { $gte: now } }),
    ]);

    return res.json({
      users: {
        total: totalUsers,
        students: studentCount,
        lecturers: lecturerCount,
        admins: adminCount,
        active: activeUsers,
        blocked: blockedUsers,
      },
      sessions: {
        activeUpcoming: activeUpcomingSessions,
      },
    });
  } catch (error) {
    console.error('Admin getAdminStats error:', error.message);
    return res.status(500).json({ message: 'Failed to load admin stats' });
  }
};

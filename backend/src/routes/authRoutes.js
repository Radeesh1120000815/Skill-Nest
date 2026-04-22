import express from 'express';
import { 
  registerUser, 
  loginUser, 
  getUserProfile,
  forgotPassword, 
  resetPassword,
  updatePassword ,// 🔴 Aluthen ekathu kala: Dashboard eken password maru karanna
  updateKuppiRole,
  updateUserProfile
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import User from '../models/userModel.js'; 

const router = express.Router();

// 🔓 Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// 🔐 Password Reset Routes 
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

// 🔒 Private route - Profile details
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);

// 🔒 Private route - Change Password from Dashboard (Aluthen ekathu kala)
router.put('/update-password', protect, updatePassword);

// 🔓 Public route - Update Kuppi role
router.put('/update-kuppi-role', updateKuppiRole);

// 🟢 GET: Senior Mentors (Dashboard list eka hadanna)
router.get('/mentors', protect, async (req, res) => {
  try {
    const mentors = await User.find({ role: 'senior' }).select('-password');
    res.json(mentors);
  } catch (error) {
    res.status(500).json({ message: "Server error fetching mentors", error: error.message });
  }
});

// 🏆 CREATE: Mentor විසින් Badge එකක් ලබා දීම
router.post('/award-badge/:studentId', protect, async (req, res) => {
  try {
    const { badgeName } = req.body;
    const student = await User.findById(req.params.studentId);

    if (!student) return res.status(404).json({ message: "Student not found" });

    // Check if badge already exists
    const hasBadge = student.badges && student.badges.some(b => b.badgeName === badgeName);
    if (hasBadge) return res.status(400).json({ message: "Student already has this exact badge!" });

    // Update logic
    const updatedBadges = [...(student.badges || []), { badgeName, earnedAt: Date.now() }];
    const updatedPoints = (student.points || 0) + 100;

    student.badges = updatedBadges;
    student.points = updatedPoints;
    await student.save();

    res.json({ message: `Awarded '${badgeName}' & 100 Points! 🏆`, points: student.points });
  } catch (error) {
    res.status(500).json({ message: "Server error awarding badge" });
  }
});

// 🔄 UPDATE: Badge එකක නම වෙනස් කිරීම
router.put('/update-badge/:studentId/:badgeId', protect, async (req, res) => {
  try {
    const { badgeName } = req.body;
    const { studentId, badgeId } = req.params;

    const student = await User.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    const badge = student.badges.id(badgeId);
    if (!badge) return res.status(404).json({ message: "Badge not found" });

    badge.badgeName = badgeName;
    await student.save();

    res.json({ message: "Badge updated successfully! 🔄" });
  } catch (error) {
    res.status(500).json({ message: "Server error updating badge" });
  }
});

// ❌ DELETE: Badge එකක් ඉවත් කිරීම
router.delete('/delete-badge/:studentId/:badgeId', protect, async (req, res) => {
  try {
    const { studentId, badgeId } = req.params;

    const student = await User.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    student.badges = student.badges.filter(b => b._id.toString() !== badgeId);
    student.points = Math.max(0, (student.points || 0) - 100);

    await student.save();
    res.json({ message: "Badge removed and points deducted. ❌" });
  } catch (error) {
    res.status(500).json({ message: "Server error deleting badge" });
  }
});

export default router;
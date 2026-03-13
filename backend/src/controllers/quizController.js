import QuizGrade from '../models/quizGradeModel.js';
import User from '../models/userModel.js';

// @desc    Submit quiz results and update student stats
// @route   POST /api/quizzes/submit
export const submitQuiz = async (req, res) => {
  const { group_id, score, feedback } = req.body;

  try {
    const quizResult = await QuizGrade.create({
      student_id: req.user._id,
      group_id,
      score,
      feedback,
      is_completed: true
    });

    // Badge Logic: 80+ score ekak gaththama auto badge eka user model ekata update wenawa
    if (score >= 80) {
      await User.findByIdAndUpdate(req.user._id, {
        $addToSet: { badges: 'Fast Learner' } 
      });
    }

    res.status(201).json({ message: 'Quiz submitted successfully!', quizResult });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
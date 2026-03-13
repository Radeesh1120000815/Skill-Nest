import mongoose from 'mongoose';

const quizGradeSchema = mongoose.Schema(
  {
    student_id: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    group_id: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'KuppiGroup', 
      required: true 
    },
    score: { 
      type: Number, 
      required: true 
    },
    is_completed: { 
      type: Boolean, 
      default: false 
    },
    feedback: { 
      type: String 
    }
  },
  { timestamps: true }
);

const QuizGrade = mongoose.model('QuizGrade', quizGradeSchema);
export default QuizGrade;
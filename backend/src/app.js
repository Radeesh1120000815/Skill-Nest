import express from 'express';
import cors from 'cors';

import authRoutes from './routes/authRoutes.js';
import groupRoutes from './routes/groupRoutes.js'; 
import quizRoutes from './routes/quizRoutes.js';

const app = express();

// 🔴 Ultimate CORS Fix - සියලුම Origins සහ Headers වලට ඉඩ දීම
app.use(cors({
  origin: '*', // Frontend එකේ මොන port එකෙන් ආවත් allow කරනවා
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// API Endpoints
app.use('/api/auth', authRoutes); 
app.use('/api/groups', groupRoutes); 
app.use('/api/quizzes', quizRoutes);

// Test Route
app.get('/', (req, res) => {
  res.send('Skill-Nest Backend is Running!');
});

export default app;
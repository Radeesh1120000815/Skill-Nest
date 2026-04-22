import express from 'express';
import cors from 'cors';


import authRoutes from './routes/authRoutes.js';
import groupRoutes from './routes/groupRoutes.js'; 
import quizRoutes from './routes/quizRoutes.js';
import lecturerRoutes from './routes/lecturerRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import sessionRoutes from './routes/sessionRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

//Resource Mnagement Routes
import resourceRoutes      from './routes/resourceRoutes.js';
import bookmarkRoutes      from './routes/bookmarkRoutes.js';
import adminResourceRoutes from './routes/adminResourceRoutes.js';

//Booking Routes
import bookingRoutes from './routes/bookingRoutes.js';




const app = express();

// Global request logger middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// 🔴 Ultimate CORS Fix - සියලුම Origins සහ Headers වලට ඉඩ දීම
app.use(cors({
  origin: '*', // Frontend එකේ මොන port එකෙන් ආවත් allow කරනවා
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  // Allow our custom x-user-id header as well so browser preflight passes
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Required for multipart form fields



// API Endpoints
app.use('/api/auth', authRoutes); 
app.use('/api/groups', groupRoutes); 
app.use('/api/quizzes', quizRoutes);
app.use('/api/resources',        resourceRoutes);      // Public + auth resource endpoints
app.use('/api/bookmarks',        bookmarkRoutes);      // GET /api/bookmarks/my
app.use('/api/admin/resources',  adminResourceRoutes); // Admin approval queue
app.use('/api/admin', adminRoutes);
app.use('/api/sessions', sessionRoutes); //session route registration
app.use('/api/lecturers', lecturerRoutes);
app.use('/api/bookings',bookingRoutes); //
app.use('/api/students', studentRoutes);

// Test Route
app.get('/', (req, res) => {
  res.send('Skill-Nest Backend is Running!');
});

export default app;
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Pages import kireema (Relative paths check karanna)
import HomePage from './pages/HomePage';
import ResetPassword from './pages/ResetPassword';
import Login from './pages/Login';
import SignIn from './pages/SignIn';
import Register from './pages/Register';
import JuniorDashboard from './pages/JuniorDashboard';
import SeniorDashboard from './pages/SeniorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminManageUsers from './pages/AdminManageUsers';
import AdminSessionsOverview from './pages/AdminSessionsOverview';
import StudentDashboard from './pages/StudentDashboard';
import LecturerDashboard from './pages/LecturerDashboard';
import LecturerCreateSession from './pages/LecturerCreateSession';
import LecturerSessions from './pages/LecturerSessions';
import LecturerCompletedSessions from './pages/LecturerCompletedSessions';
import LecturerPendingRequests from './pages/LecturerPendingRequests';
import LecturerActiveStudents from './pages/LecturerActiveStudents';
import ForgotPassword from './pages/ForgotPassword';
import MainForgot from './pages/MainForgot';
import Sessions from './pages/Sessions';
import HelpCenter from './pages/HelpCenter';
import About from './pages/About';
import Contact from './pages/Contact';
import ScrollToTop from './components/ScrollToTop';
import ResourceHub from './pages/ResourceHub.jsx';
import ResourceDetail from './pages/ResourceDetail.jsx';
import UploadResource from './pages/UploadResource.jsx';
import MyUploads from './pages/MyUploads.jsx';
import MyBookmarks from './pages/MyBookmarks.jsx';
import AdminResourceQueue from './pages/AdminResourceQueue.jsx';
import UploadNewVersion from './pages/UploadNewVersion.jsx';
import { ResourceProvider } from './components/context/ResourceContext.jsx';
import WatchSession from './pages/WatchSession.jsx';
import FeedbackPage from './pages/FeedbackPage.jsx';
import './index.css'; // CSS imports


/**  Simple route guard — redirects to /login if no token
const PrivateRoute = ({ children, allowedRoles }) => {
  const userStr = localStorage.getItem('user');
  const user    = userStr ? JSON.parse(userStr) : null;
  const token   = localStorage.getItem('token');

  if (!token || !user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }
  return children;
}; */

function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="App min-h-screen">
        <Routes>
          {/* Home Page */}
          <Route path="/" element={<HomePage />} />
          {/* Sessions Page */}
          <Route path="/sessions" element={<Sessions />} />
          {/* About Page */}
          <Route path="/about" element={<About />} />
          {/* Contact Page */}
          <Route path="/contact" element={<Contact />} />
          {/* Help Center Page */}
          <Route path="/help-center" element={<HelpCenter />} />

          {/* Resource routes */}
          <Route path="/resources" element={<ResourceProvider><ResourceHub /></ResourceProvider>} />
          <Route path="/resources/:id" element={<ResourceProvider><ResourceDetail /></ResourceProvider>} />
          <Route path="/resources/:id/new-version" element={<ResourceProvider><UploadNewVersion /></ResourceProvider>} />

          <Route path="/register" element={<Register />} />

          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signin" element={<SignIn />} />

          {/* Dashboard Routes (Mentorship platform eke dashboards) */}
          <Route path="/junior-dashboard" element={<JuniorDashboard />} />
          <Route path="/senior-dashboard" element={<SeniorDashboard />} />

          {/*Lecturer dashboard + Lecture sessions */}
          <Route path="/lecturer-dashboard" element={<LecturerDashboard />} />
          <Route path="/lecturer-create-session" element={<LecturerCreateSession />} />
          <Route path="/lecturer-sessions" element={<LecturerSessions />} />
          <Route path="/lecturer-completed-sessions" element={<LecturerCompletedSessions />} />
          <Route path="/lecturer-pending-requests" element={<LecturerPendingRequests />} />
          <Route path="/lecturer-active-students" element={<LecturerActiveStudents />} />

          {/* Student Dashboard +  Lecture Session */}
          <Route path="/student-dashboard" element={<StudentDashboard />} />
          <Route path="/watch-session/:id" element={<WatchSession />} />
          <Route path="/feedback/:id" element={<FeedbackPage />} />

          {/* Admin routes */}
          <Route path="/admin" element={<ResourceProvider><AdminDashboard /></ResourceProvider>} />
          <Route path="/admin-dashboard" element={<ResourceProvider><AdminDashboard /></ResourceProvider>} />
          <Route path="/admin/users" element={<ResourceProvider><AdminManageUsers /></ResourceProvider>} />
          <Route path="/admin/sessions" element={<ResourceProvider><AdminSessionsOverview /></ResourceProvider>} />
          <Route path="/admin/resources" element={<ResourceProvider><AdminResourceQueue /></ResourceProvider>} />

          {/* Password reset routes */}
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/main-forgot" element={<MainForgot />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* Private: any authenticated user can upload */}
          <Route
            path="/upload-resource"
            element={<ResourceProvider><UploadResource /></ResourceProvider>}
          />

          {/* Private: view and manage own uploads */}
          <Route
            path="/resources/my-uploads"
            element={<ResourceProvider><MyUploads /></ResourceProvider>}
          />

          {/* Private: personal bookmarks (students primarily) */}
          <Route
            path="/resources/my-bookmarks"
            element={<ResourceProvider><MyBookmarks /></ResourceProvider>}
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/signin" />} />
        </Routes>
          
      </div>
    </Router>
  );
  return <HomePage />;
}

export default App; 
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Pages import kireema (Relative paths check karanna)
import HomePage from './pages/HomePage';
import ResetPassword from './pages/ResetPassword';
import Login from './pages/Login';
import SignIn from './pages/SignIn';
import Register from './pages/Register';
import JuniorDashboard from './pages/JuniorDashboard';
import SeniorDashboard from './pages/SeniorDashboard';
import ForgotPassword from './pages/ForgotPassword';
import MainForgot from './pages/MainForgot';
import Sessions from './pages/Sessions';
import HelpCenter from './pages/HelpCenter';
import About from './pages/About';
import Contact from './pages/Contact';
import AdminDashboard from './pages/AdminDashboard.jsx';
import ScrollToTop from './components/ScrollToTop';
import ResourceHub        from './pages/ResourceHub.jsx';
import ResourceDetail     from './pages/ResourceDetail.jsx';
import UploadResource     from './pages/UploadResource.jsx';
import MyUploads          from './pages/MyUploads.jsx';
import MyBookmarks        from './pages/MyBookmarks.jsx';
import AdminResourceQueue from './pages/AdminResourceQueue.jsx';
import UploadNewVersion from './pages/UploadNewVersion.jsx';

// Resource context provider
import { ResourceProvider } from './components/context/ResourceContext.jsx'

// CSS imports
import './index.css'; 

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

       
          <Route path="/register" element={<Register />} />
          
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signin" element={<SignIn />} />
          
          {/* Dashboard Routes (Mentorship platform eke dashboards) */}
          <Route path="/junior-dashboard" element={<JuniorDashboard />} />
          <Route path="/senior-dashboard" element={<SeniorDashboard />} />



          {/* Oya dila nathi path ekak gahuvoth Login ekata redirect karanawa (404 safety) */}
          <Route path="*" element={<Navigate to="/login" />} />

          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/main-forgot" element={<MainForgot />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          <Route path="/admin" element={<ResourceProvider><AdminDashboard /></ResourceProvider>} />

          <Route path="/resources"    element={<ResourceProvider><ResourceHub /></ResourceProvider>} />
          <Route path="/resources/:id" element={<ResourceProvider><ResourceDetail /></ResourceProvider>} />
          <Route path="/resources/:id/new-version" element={ <ResourceProvider><UploadNewVersion /></ResourceProvider>} />

          {/* Private: any authenticated user can upload */}
            <Route
              path="/upload-resource"
              element={
                //<PrivateRoute allowedRoles={['STUDENT', 'LECTURER', 'ADMIN']}>
                  <ResourceProvider><UploadResource /></ResourceProvider>
                //</PrivateRoute>
              }
            />

            {/* Private: view and manage own uploads */}
            <Route
              path="/resources/my-uploads"
              element={
                //<PrivateRoute allowedRoles={['STUDENT', 'LECTURER', 'ADMIN']}>
                  <ResourceProvider><MyUploads /></ResourceProvider>
                //</PrivateRoute>
              }
            />

            {/* Private: personal bookmarks (students primarily) */}
            <Route
              path="/resources/my-bookmarks"
              element={
                //<PrivateRoute allowedRoles={['STUDENT', 'LECTURER', 'ADMIN']}>
                  <ResourceProvider><MyBookmarks /></ResourceProvider>
                //</PrivateRoute>
              }
            />
            {/* Admin only: pending review queue */}
            <Route
              path="/admin/resources"
              element={
                //<PrivateRoute allowedRoles={['ADMIN']}>
                  <ResourceProvider><AdminResourceQueue /></ResourceProvider>
                //</PrivateRoute>
              }
            />

            
          {/* Fallback */}
            <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>

   
    
  );
}

export default App;
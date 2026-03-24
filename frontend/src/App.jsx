import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Pages import kireema (Relative paths check karanna)
import ResetPassword from './pages/ResetPassword';
import Login from './pages/Login';
import JuniorDashboard from './pages/JuniorDashboard';
import SeniorDashboard from './pages/SeniorDashboard';
import ForgotPassword from './pages/ForgotPassword';
import ResourceHub        from './pages/ResourceHub.jsx';
import ResourceDetail     from './pages/ResourceDetail.jsx';
import UploadResource     from './pages/UploadResource.jsx';
import MyUploads          from './pages/MyUploads.jsx';
import MyBookmarks        from './pages/MyBookmarks.jsx';
import AdminResourceQueue from './pages/AdminResourceQueue.jsx';

// Resource context provider
import { ResourceProvider } from './components/context/ResourceContext.jsx'

// CSS imports
import './index.css'; 

/** 🆕 Simple route guard — redirects to /login if no token
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
    <ResourceProvider>
      <Router>
      <div className="App min-h-screen">
        <Routes>

       
          {/* Kelinma domain ekata enakota Login ekata redirect karanawa */}
          <Route path="/" element={<Navigate to="/login" />} />
          
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          
          {/* Dashboard Routes (Mentorship platform eke dashboards) */}
          <Route path="/junior-dashboard" element={<JuniorDashboard />} />
          <Route path="/senior-dashboard" element={<SeniorDashboard />} />



          {/* Oya dila nathi path ekak gahuvoth Login ekata redirect karanawa (404 safety) */}
          <Route path="*" element={<Navigate to="/login" />} />

          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          <Route path="/resources"    element={<ResourceHub />} />
          <Route path="/resources/:id" element={<ResourceDetail />} />

          {/* Private: any authenticated user can upload */}
            <Route
              path="/upload-resource"
              element={
                //<PrivateRoute allowedRoles={['STUDENT', 'LECTURER', 'ADMIN']}>
                  <UploadResource />
                //</PrivateRoute>
              }
            />

            {/* Private: view and manage own uploads */}
            <Route
              path="/resources/my-uploads"
              element={
                //<PrivateRoute allowedRoles={['STUDENT', 'LECTURER', 'ADMIN']}>
                  <MyUploads />
                //</PrivateRoute>
              }
            />

            {/* Private: personal bookmarks (students primarily) */}
            <Route
              path="/resources/my-bookmarks"
              element={
                //<PrivateRoute allowedRoles={['STUDENT', 'LECTURER', 'ADMIN']}>
                  <MyBookmarks />
                //</PrivateRoute>
              }
            />
            {/* Admin only: pending review queue */}
            <Route
              path="/admin/resources"
              element={
                //<PrivateRoute allowedRoles={['ADMIN']}>
                  <AdminResourceQueue />
                //</PrivateRoute>
              }
            />

            
          {/* Fallback */}
            <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>

    </ResourceProvider>
    
  );
}

export default App;
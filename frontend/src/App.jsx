import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Pages import kireema (Relative paths check karanna)
import ResetPassword from './pages/ResetPassword';
import Login from './pages/Login';
import JuniorDashboard from './pages/JuniorDashboard';
import SeniorDashboard from './pages/SeniorDashboard';
import ForgotPassword from './pages/ForgotPassword';

// CSS imports
import './index.css'; 

function App() {
  return (
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
        </Routes>
      </div>
    </Router>
  );
}

export default App;
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
import Resources from './pages/Resources';
import Sessions from './pages/Sessions';
import HelpCenter from './pages/HelpCenter';
import About from './pages/About';
import Contact from './pages/Contact';
import ScrollToTop from './components/ScrollToTop';

// CSS imports
import './index.css'; 

function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="App min-h-screen">
        <Routes>
          {/* Home Page */}
          <Route path="/" element={<HomePage />} />
          {/* Resources Page */}
          <Route path="/resources" element={<Resources />} />
          {/* Sessions Page */}
          <Route path="/sessions" element={<Sessions />} />
          {/* About Page */}
          <Route path="/about" element={<About />} />
          {/* Contact Page */}
          <Route path="/contact" element={<Contact />} />
          {/* Help Center Page */}
          <Route path="/help-center" element={<HelpCenter />} />
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/main-forgot" element={<MainForgot />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/register" element={<Register />} />
          {/* Dashboard Routes (Mentorship platform eke dashboards) */}
          <Route path="/junior-dashboard" element={<JuniorDashboard />} />
          <Route path="/senior-dashboard" element={<SeniorDashboard />} />
          {/* Oya dila nathi path ekak gahuvoth Login ekata redirect karanawa (404 safety) */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
          
      </div>
    </Router>
  );
  return <HomePage />;
}

export default App;
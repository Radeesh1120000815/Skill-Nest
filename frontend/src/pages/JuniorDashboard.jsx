import { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import {
  BookOpen, Calendar, Users, Award,
  LogOut, Bell, Search, PlayCircle, Star, Clock,
  ChevronRight, Plus, Flame, Target, Zap, CheckCircle,
  TrendingUp, Sparkles, MonitorPlay, X, Compass, Filter,
  Youtube, LayoutDashboard, UserCheck, ShieldCheck, ShieldAlert, Mail, Briefcase, Code,
  Trash2, CheckSquare, Settings, Bookmark, User, BellRing, Lock,
  Camera, Key, Smartphone, Globe, Send, Save, MessageSquare, Inbox, CornerDownRight, CheckCheck, Lightbulb, Activity, Edit3, Heart, ChevronLeft, Crown, BarChart3, Share2, Timer,
  UserPlus, Cpu, Trophy
} from 'lucide-react';
import { T, Icon, sharedStyles } from '../components/resources/theme.jsx';
import { calculateMatchScore, getTopMatches } from '../utils/matchingService'; // I should move the service to frontend utils or import it if possible.
// Wait, the user didn't ask for a shared util, but I can use the logic.

const HERO_SLIDES = [
  {
    title: 'Master Your Tech Stack',
    subtitle: 'Access 24/7 expert briefings, recorded session dossiers, and live technical masterclasses to accelerate your career.',
    image: 'https://img.freepik.com/premium-photo/high-tech-digital-blueprint-smart-city-urban-planning-with-augmented-reality-interface_101448-4361.jpg',
    badge: '🚀 Skill Nest Intel'
  },
  {
    title: 'Collaborative Excellence',
    subtitle: 'Sync with verified industry professionals, participate in high-velocity challenges, and earn elite certification badges.',
    image: 'https://img.freepik.com/premium-photo/students-collaborating-modern-tech-environment-with-holographic-displays_101448-4100.jpg',
    badge: '🏆 Nexus Academy'
  }
];
const JuniorDashboard = () => {
  const [user, setUser] = useState(null);
  const [greeting, setGreeting] = useState('');
  const [groups, setGroups] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔴 TABS & MODALS STATE
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isExploreOpen, setIsExploreOpen] = useState(false);

  // 🔴 SEARCH STATES
  const [exploreSearch, setExploreSearch] = useState('');
  const [mentorSearch, setMentorSearch] = useState('');

  // 🔴 DROPDOWN STATES
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  // 🔴 SETTINGS INNER TABS & TOGGLES
  const [settingsTab, setSettingsTab] = useState('profile');
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(true);
  const [marketingNotif, setMarketingNotif] = useState(false);
  const [profilePublic, setProfilePublic] = useState(true);

  // 🔴 PROFILE UPDATE STATE
  const fileInputRef = useRef(null);
  const [profileData, setProfileData] = useState({
    name: '', headline: '', bio: '',
    interests: '', industry: '', languages: 'English'
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [rankingFilter, setRankingFilter] = useState('mentors'); // 🔴 Leaderboard Toggle State

  // 🔴 STUDY GOALS (Local Storage)
  const [goals, setGoals] = useState(() => {
    const saved = localStorage.getItem('studyGoals');
    return saved ? JSON.parse(saved) : [
      { id: 1, text: 'Review Data Structures', completed: false },
      { id: 2, text: 'Complete React Masterclass', completed: true }
    ];
  });
  const [newGoal, setNewGoal] = useState('');

  // 🔴 BOOKMARKS
  const [bookmarked, setBookmarked] = useState(() => {
    const saved = localStorage.getItem('bookmarkedSessions');
    return saved ? JSON.parse(saved) : [];
  });

  // 🔴 MENTOR RATING SYSTEM (Local Storage)
  const [mentorRatings, setMentorRatings] = useState(() => {
    const saved = localStorage.getItem('globalMentorRatings');
    return saved ? JSON.parse(saved) : {};
  });

  // 🔴 CONTINUOUS 2-WAY MESSAGING SYSTEM STATE
  const [platformMessages, setPlatformMessages] = useState(() => {
    const saved = localStorage.getItem('platformMessages');
    return saved ? JSON.parse(saved) : [];
  });
  const [contactModal, setContactModal] = useState({
    isOpen: false,
    mentor: null,
    message: '',
    type: 'Question',
    definedOutcomes: ''
  });
  const [isSendingMsg, setIsSendingMsg] = useState(false);
  const [msgSuccess, setMsgSuccess] = useState(false);

  // Thread Reply States
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");

  // 🔴 FEEDBACK MODAL STATE
  const [feedbackModal, setFeedbackModal] = useState({
    isOpen: false,
    session: null,
    rating: 5,
    comment: '',
    skillMatrix: {},
    isSubmitted: false
  });
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  const [sessionFeedback, setSessionFeedback] = useState(() => {
    const saved = localStorage.getItem('sessionFeedback');
    return saved ? JSON.parse(saved) : [];
  });

  const [heroSlide, setHeroSlide] = useState(0);

  // 🔴 Sidebar expansion state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Message Editing States (CRUD)
  const [editingMsgId, setEditingMsgId] = useState(null);
  const [editingText, setEditingText] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');

    const userInfoStr = localStorage.getItem('userInfo');
    if (userInfoStr) {
      const parsedUser = JSON.parse(userInfoStr);

      const userRole = parsedUser.role?.toLowerCase();
      if (userRole === 'senior' || userRole === 'mentor') {
        navigate('/senior-dashboard', { replace: true });
        return;
      }

      setUser(parsedUser);
      setProfileData({
        name: parsedUser.name || '',
        headline: parsedUser.headline || '',
        bio: parsedUser.bio || ''
      });
      fetchData(parsedUser.token);
    } else {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    localStorage.setItem('studyGoals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('bookmarkedSessions', JSON.stringify(bookmarked));
  }, [bookmarked]);

  useEffect(() => {
    localStorage.setItem('globalMentorRatings', JSON.stringify(mentorRatings));
  }, [mentorRatings]);

  // Auto-advance hero carousel every 6s
  useEffect(() => {
    if (activeTab !== 'dashboard') return;
    const t = setInterval(() => setHeroSlide(s => (s + 1) % HERO_SLIDES.length), 6000);
    return () => clearInterval(t);
  }, [activeTab]);

  // Sync Multi-Dashboard state periodically (ratings, feedback, messages)
  useEffect(() => {
    const interval = setInterval(() => {
      const savedMsgs = localStorage.getItem('platformMessages');
      if (savedMsgs) setPlatformMessages(JSON.parse(savedMsgs));

      const savedFeedback = localStorage.getItem('sessionFeedback');
      if (savedFeedback) setSessionFeedback(JSON.parse(savedFeedback));

      const savedMentorRatings = localStorage.getItem('globalMentorRatings');
      if (savedMentorRatings) setMentorRatings(JSON.parse(savedMentorRatings));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async (token) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const profileRes = await axios.get('http://localhost:5001/api/auth/profile', config);

      const dbRole = profileRes.data.role?.toLowerCase();
      if (dbRole === 'senior' || dbRole === 'mentor') {
        navigate('/senior-dashboard', { replace: true });
        return;
      }

      const userInfoStr = localStorage.getItem('userInfo');
      let localExtras = {};
      if (userInfoStr) {
        const parsed = JSON.parse(userInfoStr);
        localExtras = { avatar: parsed.avatar, headline: parsed.headline, bio: parsed.bio };
      }

      setUser({ ...profileRes.data, ...localExtras });
      setProfileData(prev => ({
        name: profileRes.data.name || prev.name,
        headline: profileRes.data.headline || localExtras.headline || '',
        bio: profileRes.data.bio || localExtras.bio || '',
        interests: Array.isArray(profileRes.data.interests) ? profileRes.data.interests.join(', ') : '',
        industry: profileRes.data.industry || '',
        languages: Array.isArray(profileRes.data.languages) ? profileRes.data.languages.join(', ') : 'English'
      }));

      // Sync preferences
      setProfilePublic(profileRes.data.profilePublic ?? true);
      setEmailNotif(profileRes.data.emailNotif ?? true);
      setPushNotif(profileRes.data.pushNotif ?? false);

      const groupRes = await axios.get('http://localhost:5001/api/groups', config);
      setGroups(groupRes.data.reverse());

      const mentorRes = await axios.get('http://localhost:5001/api/auth/mentors', config);
      setMentors(mentorRes.data);

    } catch (error) {
      console.error("Dashboard fetch error:", error);
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('userInfo');
        navigate('/login', { replace: true });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async (groupId) => {
    try {
      const userInfoStr = localStorage.getItem('userInfo');
      const token = userInfoStr ? JSON.parse(userInfoStr).token : '';
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const response = await axios.put(`http://localhost:5001/api/groups/join/${groupId}`, {
        userId: user?._id
      }, config);

      alert(`⏳ ${response.data.message}`);
      if (userInfoStr) {
        fetchData(JSON.parse(userInfoStr).token);
      }
    } catch (error) {
      alert(`⚠️ ${error.response?.data?.message || "Error joining group"}`);
    }
  };

  const handleHackathonRegister = async () => {
    try {
      // 1. Try to find an existing Hackathon group on the server
      const hackathonGroup = groups.find(g => g.module_name.toLowerCase().includes('hackathon'));

      if (hackathonGroup) {
        await handleJoinGroup(hackathonGroup._id);
      } else {
        // 2. If no group found, simulate enrollment by locally injecting it for the demo
        const mockHackathon = {
          _id: 'mock-hackathon-id',
          module_name: 'Monthly Hackathon',
          senior_id: { name: 'Nexus Core' },
          current_members: [user?._id],
          max_members: 256,
          session_link: 'https://skillnest.live',
          semester: 'Championship Series',
          isHackathon: true
        };

        setGroups(prev => [...prev, mockHackathon]);
        alert("🛡️ Neural Registration Successful! You have been enrolled in the Monthly Hackathon.");
      }

      // 3. Switch to schedule tab to see the registration
      setActiveTab('schedule');
    } catch (error) {
      console.error("Hackathon registration error:", error);
      alert("⚠️ Encryption error during registration. Please try again.");
    }
  };

  const handleDropSession = async (groupId, moduleName) => {
    const confirmDrop = window.confirm(`Are you sure you want to unenroll from "${moduleName}"? You will lose access to the materials.`);
    if (!confirmDrop) return;

    if (groupId === 'mock-hackathon-id') {
      setGroups(prev => prev.filter(g => g._id !== groupId));
      alert(`✅ Successfully dropped from ${moduleName}`);
      return;
    }

    try {
      const userInfoStr = localStorage.getItem('userInfo');
      const token = userInfoStr ? JSON.parse(userInfoStr).token : '';
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const response = await axios.delete(`http://localhost:5001/api/groups/${groupId}/remove-student/${user?._id}`, config);
      alert(`✅ Successfully dropped from ${moduleName}`);
      if (userInfoStr) {
        fetchData(JSON.parse(userInfoStr).token);
      }
    } catch (error) {
      alert(`⚠️ ${error.response?.data?.message || "Error dropping session"}`);
    }
  };

  const handleAddGoal = (e) => {
    e.preventDefault();
    if (!newGoal.trim()) return;
    setGoals([{ id: Date.now(), text: newGoal, completed: false }, ...goals]);
    setNewGoal('');
  };

  const toggleGoal = (id) => {
    setGoals(goals.map(g => g.id === id ? { ...g, completed: !g.completed } : g));
  };

  const deleteGoal = (id) => {
    setGoals(goals.filter(g => g.id !== id));
  };

  const toggleBookmark = (groupId) => {
    if (bookmarked.includes(groupId)) {
      setBookmarked(bookmarked.filter(id => id !== groupId));
    } else {
      setBookmarked([...bookmarked, groupId]);
    }
  };

  const handleRateMentor = (mentorId, rating) => {
    const studentId = user?._id;
    if (!studentId) return;

    setMentorRatings(prev => {
      const currentMentorRatings = prev[mentorId] || {};
      const updatedMentorRatings = { ...currentMentorRatings, [studentId]: rating };
      const newState = { ...prev, [mentorId]: updatedMentorRatings };

      localStorage.setItem('globalMentorRatings', JSON.stringify(newState));
      return newState;
    });

    alert(`🌟 Rating applied! Global average for this mentor has been synchronized.`);
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    setIsSubmittingFeedback(true);

    // ⏳ Simulated Neural Link latency
    await new Promise(resolve => setTimeout(resolve, 1500));

    const sessionId = feedbackModal.session?._id;
    if (!sessionId) {
      setIsSubmittingFeedback(false);
      return;
    }

    const feedbackData = {
      sessionId: String(sessionId),
      moduleName: feedbackModal.session?.module_name,
      rating: feedbackModal.rating,
      comment: feedbackModal.comment,
      studentName: user?.name,
      studentAvatar: user?.avatar || '',
      timestamp: new Date().toISOString()
    };

    const existing = JSON.parse(localStorage.getItem('sessionFeedback') || '[]');
    // 🔍 Filter out any previous feedback for THIS specific session using robust string comparison
    const filtered = existing.filter(f => String(f.sessionId) !== String(sessionId));
    const updated = [...filtered, feedbackData];

    localStorage.setItem('sessionFeedback', JSON.stringify(updated));
    setSessionFeedback(updated);

    setFeedbackModal(prev => ({ ...prev, isSubmitted: true }));
    setIsSubmittingFeedback(false);
  };

  // 🔴 SEND INITIAL MESSAGE LOGIC
  const handleSendContact = async (e) => {
    e.preventDefault();
    if (!contactModal.message.trim()) return;

    setIsSendingMsg(true);

    try {
      const messagePayload = {
        id: Date.now().toString(),
        senderId: user._id,
        senderName: user.name,
        senderAvatar: user.avatar || '',
        receiverId: contactModal.mentor._id,
        receiverName: contactModal.mentor.name,
        type: contactModal.type || 'Question',
        text: contactModal.message,
        definedOutcomes: contactModal.definedOutcomes || '', // 🔴 Added Goal tracking
        timestamp: new Date().toISOString(),
        replies: [],
        readByJunior: true,
        readBySenior: false
      };

      const existingMessages = JSON.parse(localStorage.getItem('platformMessages')) || [];
      const updatedMessages = [messagePayload, ...existingMessages];

      localStorage.setItem('platformMessages', JSON.stringify(updatedMessages));
      setPlatformMessages(updatedMessages);

      setTimeout(() => {
        setIsSendingMsg(false);
        setMsgSuccess(true);
        setTimeout(() => {
          setContactModal({ isOpen: false, mentor: null, message: '', type: 'Question' });
          setMsgSuccess(false);
          setActiveTab('inbox');
        }, 1500);
      }, 800);

    } catch (error) {
      console.error("Message error:", error);
      alert("⚠️ Failed to send message.");
      setIsSendingMsg(false);
    }
  };

  // 🔴 CONTINUOUS CHAT: SEND REPLY IN THREAD
  const handleThreadReply = (threadId) => {
    if (!replyText.trim()) return;
    const updatedMessages = platformMessages.map(m => {
      if (m.id === threadId) {
        const newReply = {
          id: Date.now().toString(),
          senderId: user._id,
          senderName: user.name,
          text: replyText,
          timestamp: new Date().toISOString()
        };
        return {
          ...m,
          replies: [...(m.replies || []), newReply],
          readBySenior: false,
          readByJunior: true
        };
      }
      return m;
    });
    setPlatformMessages(updatedMessages);
    localStorage.setItem('platformMessages', JSON.stringify(updatedMessages));
    setReplyingTo(null);
    setReplyText('');
  };

  const startEditingMessage = (msg) => {
    setEditingMsgId(msg.id);
    setEditingText(msg.text);
  };

  const saveEditedMessage = (id) => {
    if (!editingText.trim()) return;
    const updated = platformMessages.map(m => m.id === id ? { ...m, text: editingText } : m);
    setPlatformMessages(updated);
    localStorage.setItem('platformMessages', JSON.stringify(updated));
    setEditingMsgId(null);
    setEditingText("");
    alert("✅ Message updated!");
  };

  const handleDeleteMessage = (id) => {
    const confirmDel = window.confirm("🗑️ Are you sure you want to permanently delete this message?");
    if (!confirmDel) return;
    const updated = platformMessages.filter(m => m.id !== id);
    setPlatformMessages(updated);
    localStorage.setItem('platformMessages', JSON.stringify(updated));
  };

  const handleEditThreadReply = (threadId, replyId, newText) => {
    if (!newText.trim()) return;
    const updatedMessages = platformMessages.map(m => {
      if (m.id === threadId) {
        const updatedReplies = m.replies.map(r => r.id === replyId ? { ...r, text: newText } : r);
        return { ...m, replies: updatedReplies };
      }
      return m;
    });
    setPlatformMessages(updatedMessages);
    localStorage.setItem('platformMessages', JSON.stringify(updatedMessages));
    setEditingMsgId(null);
    setEditingText('');
  }

  const handleDeleteThreadReply = (threadId, replyId) => {
    const confirmDel = window.confirm("🗑️ Are you sure you want to delete this specific reply?");
    if (!confirmDel) return;
    const updatedMessages = platformMessages.map(m => {
      if (m.id === threadId) {
        const updatedReplies = m.replies.filter(r => r.id !== replyId);
        return { ...m, replies: updatedReplies };
      }
      return m;
    });
    setPlatformMessages(updatedMessages);
    localStorage.setItem('platformMessages', JSON.stringify(updatedMessages));
  }

  const markReplyAsRead = (msgId) => {
    const updated = platformMessages.map(m => m.id === msgId ? { ...m, readByJunior: true } : m);
    setPlatformMessages(updated);
    localStorage.setItem('platformMessages', JSON.stringify(updated));
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setUser(prev => ({ ...prev, avatar: base64String }));
        const userInfoStr = localStorage.getItem('userInfo');
        if (userInfoStr) {
          const parsed = JSON.parse(userInfoStr);
          parsed.avatar = base64String;
          localStorage.setItem('userInfo', JSON.stringify(parsed));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const userInfoStr = localStorage.getItem('userInfo');
      const token = userInfoStr ? JSON.parse(userInfoStr).token : '';
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const dataToSave = {
        ...profileData,
        interests: profileData.interests.split(',').map(s => s.trim()).filter(s => s !== ''),
        languages: profileData.languages.split(',').map(l => l.trim()).filter(l => l !== '')
      };

      const response = await axios.put('http://localhost:5001/api/auth/profile', dataToSave, config);

      setUser(prev => ({ ...prev, ...response.data }));

      if (userInfoStr) {
        const parsed = JSON.parse(userInfoStr);
        Object.assign(parsed, response.data);
        localStorage.setItem('userInfo', JSON.stringify(parsed));
      }

      alert("✅ Mentorship Profile updated and synced!");
    } catch (error) {
      alert("⚠️ Failed to update profile.");
      console.error(error);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("⚠️ New passwords do not match!");
      return;
    }

    setIsSavingPassword(true);
    try {
      const userInfoStr = localStorage.getItem('userInfo');
      const token = userInfoStr ? JSON.parse(userInfoStr).token : '';
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const response = await axios.put('http://localhost:5001/api/auth/update-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      }, config);

      alert(`✅ ${response.data.message}`);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error("Password update error:", error);
      alert(`⚠️ ${error.response?.data?.message || "Failed to update password"}`);
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleSavePreferences = async () => {
    setIsSavingPreferences(true);
    try {
      const userInfoStr = localStorage.getItem('userInfo');
      const token = userInfoStr ? JSON.parse(userInfoStr).token : '';
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const response = await axios.put('http://localhost:5001/api/auth/profile', {
        profilePublic,
        emailNotif,
        pushNotif
      }, config);

      alert("✅ Preferences saved successfully!");
      setUser({ ...user, ...response.data });
      localStorage.setItem('userInfo', JSON.stringify({ ...JSON.parse(userInfoStr), ...response.data }));
    } catch (error) {
      console.error("Preferences update error:", error);
      alert("⚠️ Failed to save preferences");
    } finally {
      setIsSavingPreferences(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/login', { replace: true });
  };

  const handleGlobalSearch = (e) => {
    const query = e.target.value;
    setExploreSearch(query);
    if (query.trim().length > 0 && !isExploreOpen) {
      setIsExploreOpen(true);
    }
  };

  const handleToggleNotifications = () => {
    const nextState = !showNotifs;
    setShowNotifs(nextState);
    if (nextState) {
      setShowProfile(false);
      // 🔴 Mark all unread notifications as seen locally
      const updatedMessages = platformMessages.map(m =>
        (m.senderId === user?._id && (m.readByJunior === false || (m.readByJunior === undefined && m.reply !== null)))
          ? { ...m, readByJunior: true }
          : m
      );
      setPlatformMessages(updatedMessages);
      localStorage.setItem('platformMessages', JSON.stringify(updatedMessages));
    }
  };

  const myMessages = platformMessages.filter(m => m.senderId === user?._id).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  const unreadRepliesCount = myMessages.filter(m => m.readByJunior === false || (m.readByJunior === undefined && m.reply !== null)).length;

  // 🔴 DYNAMIC XP CALCULATION FOR JUNIOR
  const enrolledCount = groups.filter(g => g.current_members?.includes(user?._id)).length;
  const badgesCount = user?.badges?.length || 0;
  const calculatedXP = (user?.points || 0) + (enrolledCount * 250) + (badgesCount * 500);
  const currentLevel = Math.floor(calculatedXP / 1000) + 1;
  const nextMilestone = currentLevel * 1000;
  const xpProgress = Math.min(100, ((calculatedXP % 1000) / 1000) * 100);

  const getThread = (msg) => {
    let thread = [];
    if (msg.reply && (!msg.replies || msg.replies.length === 0)) {
      thread.push({ id: 'legacy', senderId: msg.receiverId, senderName: msg.receiverName, text: msg.reply, timestamp: msg.replyTimestamp || msg.timestamp });
    }
    if (msg.replies && msg.replies.length > 0) {
      thread = [...thread, ...msg.replies];
    }
    return thread;
  };

  const getCalculatedMentorXP = (mentor) => {
    const baseXP = mentor.points || 0;
    const hosted = groups.filter(g => g.senior_id?._id === mentor._id || g.senior_id === mentor._id).length;
    const students = groups.filter(g => g.senior_id?._id === mentor._id || g.senior_id === mentor._id).reduce((sum, g) => sum + (g.current_members?.length || 0), 0);
    return baseXP + (hosted * 500) + (students * 150) + 3000;
  };

  const globalRankedMentors = [...mentors].map((mentor, index) => {
    const xp = getCalculatedMentorXP(mentor) - (index * 340);
    return {
      ...mentor,
      id: mentor._id,
      name: mentor.name,
      headline: mentor.headline,
      xp: xp,
      level: "Senior Expert",
      avatar: mentor.avatar,
      initial: mentor.name ? mentor.name.charAt(0).toUpperCase() : 'M',
      isMe: false
    };
  }).sort((a, b) => b.xp - a.xp);


  // ---------------------------------------------------------
  // 🟢 TAB 1: DASHBOARD UI
  // ---------------------------------------------------------
  const renderDashboard = () => (
    <div className="space-y-10 animate-in fade-in duration-700">

      {/* 🚀 Modern Hero Carousel (Kuppi Space Style) */}
      <div className="relative rounded-[3.5rem] text-white shadow-2xl overflow-hidden group border border-white/10 h-[450px] md:h-[550px]">
        {/* Progress Bar Indicators */}
        <div className="absolute top-8 right-12 z-30 flex space-x-3">
          {HERO_SLIDES.map((_, i) => (
            <div key={i} className="h-1.5 rounded-full overflow-hidden bg-white/20 w-16">
              <div className={`h-full bg-blue-400 transition-all duration-[5000ms] ease-linear ${heroSlide === i ? 'w-full' : 'w-0'}`}></div>
            </div>
          ))}
        </div>

        {/* Carousel slide transition container */}
        <div className="absolute inset-0">
          {HERO_SLIDES.map((slide, index) => (
            <div key={index} className={`absolute inset-0 transition-all duration-1000 ease-in-out ${heroSlide === index ? 'opacity-100 scale-100 translate-x-0' : 'opacity-0 scale-105 translate-x-8 pointer-events-none'}`}>

              {/* Background with subtle zoom animation */}
              <div className="absolute inset-0">
                <img src={slide.image} alt="bg" className={`w-full h-full object-cover transition-transform duration-[10000ms] ${heroSlide === index ? 'scale-110' : 'scale-100'}`} />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0f172a] via-[#1e1b4b]/80 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent"></div>
              </div>

              {/* Content Overlay */}
              <div className="relative z-10 h-full flex flex-col justify-center px-10 md:px-16 max-w-4xl text-left">
                <div className="flex items-center space-x-3 mb-6 bg-white/10 w-fit px-5 py-2.5 rounded-full border border-white/20 backdrop-blur-md shadow-xl animate-in slide-in-from-left-8 duration-700">
                  <Sparkles className="w-4 h-4 text-blue-300" />
                  <p className="text-blue-100 font-black tracking-[0.3em] uppercase text-[10px] leading-none">{slide.badge}</p>
                </div>

                <h2 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter leading-[1.05] animate-in slide-in-from-left-12 duration-1000">
                  {slide.title.split(' ').map((word, i) => i === slide.title.split(' ').length - 1 ? (
                    <span key={i} className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-indigo-300 to-cyan-300 block sm:inline">{word}</span>
                  ) : word + ' ')}
                </h2>

                <p className="text-slate-200/80 text-lg mb-10 max-w-2xl leading-relaxed font-bold animate-in slide-in-from-left-16 duration-700 delay-300">
                  {slide.subtitle}
                </p>

                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 animate-in slide-in-from-bottom-8 duration-700 delay-500">
                  <button onClick={() => setIsExploreOpen(true)} className="flex items-center justify-center px-10 py-5 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:bg-blue-500 hover:scale-105 transition-all shadow-2xl shadow-blue-500/30 group/btn">
                    <Compass className="w-6 h-6 mr-3 group-hover/btn:rotate-90 transition-transform duration-500" /> Explore Sessions
                  </button>
                  <button onClick={() => setActiveTab('schedule')} className="flex items-center justify-center px-10 py-5 bg-white/5 text-white border border-white/20 rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:bg-white/10 transition-all backdrop-blur-md leading-none">
                    View My Path
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Carousel Navigation Arrows */}
        <div className="absolute bottom-10 right-12 z-30 flex space-x-4">
          <button
            onClick={() => setHeroSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
            className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl backdrop-blur-md transition-all active:scale-90"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <button
            onClick={() => setHeroSlide((prev) => (prev + 1) % HERO_SLIDES.length)}
            className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl backdrop-blur-md transition-all active:scale-90"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>

      {/* 🔴 PREMIUM QUICK METRICS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex items-center justify-between hover:-translate-y-1 transition-transform group">
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Enrolled Classes</p>
            <h4 className="text-3xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">{enrolledCount}</h4>
          </div>
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 border border-blue-100 shadow-sm group-hover:scale-110 transition-transform"><BookOpen className="w-6 h-6" /></div>
        </div>
        <div className="bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex items-center justify-between hover:-translate-y-1 transition-transform group">
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Certifications</p>
            <h4 className="text-3xl font-black text-slate-900 group-hover:text-violet-600 transition-colors">{badgesCount}</h4>
          </div>
          <div className="w-12 h-12 bg-violet-50 rounded-2xl flex items-center justify-center text-violet-600 border border-violet-100 shadow-sm group-hover:scale-110 transition-transform"><Award className="w-6 h-6" /></div>
        </div>
        <div className="bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex items-center justify-between hover:-translate-y-1 transition-transform group">
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Study Streak</p>
            <h4 className="text-3xl font-black text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-widest leading-none">12 Days</h4>
          </div>
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 border border-blue-100 shadow-sm group-hover:scale-110 transition-transform"><Flame className="w-6 h-6" /></div>
        </div>
        <div className="bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex items-center justify-between hover:-translate-y-1 transition-transform group">
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Current Level</p>
            <h4 className="text-3xl font-black text-slate-900 group-hover:text-emerald-500 transition-colors">Lv. {currentLevel}</h4>
          </div>
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 border border-emerald-100 shadow-sm group-hover:scale-110 transition-transform"><Activity className="w-6 h-6" /></div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">

        <div className="xl:col-span-2 space-y-8">
          {/* 🏆 MATCHING ENGINE: Mentors for You */}
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-3xl font-black text-slate-900 flex items-center tracking-tight">
                <Zap className="w-8 h-8 mr-3 text-yellow-500" /> Matched for You
              </h3>

            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {getTopMatches(user, mentors, 2).map((match, idx) => (
                <div key={match._id} className="bg-white p-8 rounded-[2rem] border-2 border-slate-50 shadow-sm hover:border-blue-200 transition-all group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
                  <div className="flex items-center gap-6 mb-6">
                    <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-2xl flex items-center justify-center text-white font-black text-3xl shadow-lg">
                      {match.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h5 className="text-xl font-black text-slate-900">{match.name}</h5>
                      <p className="text-sm font-bold text-blue-600">{match.headline || 'Senior Mentor'}</p>
                      <div className="flex items-center mt-2 text-yellow-500">
                        <Star className="w-4 h-4 fill-yellow-500 mr-1" />
                        <span className="text-xs font-black text-slate-700">4.9 (42 reviews)</span>
                      </div>
                    </div>
                    <div className="ml-auto text-right">
                      <div className="inline-block p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-500/30">
                        <p className="text-[10px] font-black uppercase tracking-widest text-blue-100 opacity-80 leading-none">Match</p>
                        <p className="text-xl font-black">{calculateMatchScore(user, match)}%</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {(match.skills || []).slice(0, 3).map(skill => (
                      <span key={skill} className="px-3 py-1.5 bg-slate-50 text-slate-600 rounded-lg text-[10px] font-bold border border-slate-100">{skill}</span>
                    ))}
                  </div>
                  <button
                    onClick={() => { setContactModal({ isOpen: true, mentor: match, type: 'Request Pairing', message: `Hi ${match.name}, based on our ${calculateMatchScore(user, match)}% match, I'd love to have you as my mentor!` }) }}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 bg-[length:200%_auto] hover:bg-right text-white rounded-2xl font-black text-sm uppercase tracking-[0.15em] transition-all duration-500 shadow-lg shadow-blue-500/25 flex items-center justify-center group/pair overflow-hidden relative"
                  >
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/pair:opacity-100 transition-opacity"></div>
                    <UserPlus className="w-5 h-5 mr-3 group-hover/pair:scale-110 transition-transform" />
                    <span>Connect & Start Pairing</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-3xl font-black text-slate-900 flex items-center tracking-tight">
                <Flame className="w-8 h-8 mr-3 text-orange-500" /> Trending Topics
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {groups.slice(0, 4).map((group, index) => {
                const isPending = group.pending_members?.some(id => id._id === user?._id || id === user?._id);
                const isEnrolled = group.current_members?.includes(user?._id);
                const isFull = group.current_members.length >= group.max_members;
                const fillPercentage = (group.current_members.length / group.max_members) * 100;
                const isAlt = index % 2 !== 0;

                return (
                  <div
                    key={group._id}
                    className={`bg-white/70 backdrop-blur-md p-8 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border-2 transition-all duration-700 group relative overflow-hidden text-left flex flex-col
                      ${isEnrolled ? 'border-emerald-400' :
                        isPending ? 'border-amber-400' :
                          isFull ? 'border-slate-200 opacity-80' :
                            'border-slate-100 hover:border-blue-400 hover:-translate-y-2 hover:shadow-blue-500/10'}`}
                  >
                    <div className={`absolute top-0 right-0 w-40 h-40 rounded-bl-[100px] -z-10 transition-transform duration-700 ${isAlt ? 'bg-cyan-50 group-hover:scale-125' : 'bg-blue-50 group-hover:scale-125'}`}></div>

                    <div className="flex justify-between items-start mb-6">
                      <span className={`px-4 py-2 rounded-xl text-xs font-black tracking-widest border uppercase ${isAlt ? 'bg-cyan-100/80 text-cyan-800 border-cyan-200' : 'bg-blue-100/80 text-blue-800 border-blue-200'}`}>
                        {group.semester} Series
                      </span>

                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-sm
                        ${isEnrolled ? 'bg-emerald-100 text-emerald-600 scale-110' :
                          isPending ? 'bg-amber-100 text-amber-600 animate-spin-slow' :
                            isFull ? 'bg-slate-100 text-slate-400' :
                              'bg-slate-50 text-slate-400 group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-blue-200 group-hover:rotate-12'}`}>
                        {isEnrolled ? <CheckCircle className="w-6 h-6" /> : isPending ? <Clock className="w-6 h-6" /> : <PlayCircle className="w-6 h-6" />}
                      </div>
                    </div>

                    <h4 className="font-black text-slate-900 text-2xl mb-3 leading-tight group-hover:text-blue-700 transition-colors">{group.module_name}</h4>

                    <div className="flex items-center mb-8">
                      <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-black text-lg mr-3 border border-slate-200">
                        {group.senior_id?.name ? group.senior_id.name.charAt(0).toUpperCase() : 'M'}
                      </div>
                      <div>
                        <p className="text-slate-900 font-black text-sm">{group.senior_id?.name || 'Expert Mentor'}</p>
                        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest flex items-center mt-0.5"><ShieldCheck className="w-3 h-3 mr-1 text-emerald-500" /> Verified</p>
                      </div>
                    </div>

                    <div className="mb-8 mt-auto">
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Seats Filled</span>
                        <span className={`text-sm font-black ${fillPercentage >= 80 ? 'text-amber-600' : 'text-blue-600'}`}>
                          {Math.round(fillPercentage)}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-100/50 rounded-full h-2.5 overflow-hidden shadow-inner">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ${fillPercentage >= 80 ? 'bg-amber-500' : 'bg-gradient-to-r from-blue-500 to-indigo-500'}`}
                          style={{ width: `${fillPercentage}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      {isEnrolled ? (
                        <div className="flex space-x-2">
                          <a href={group.session_link} target="_blank" rel="noreferrer" className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl text-center flex items-center justify-center shadow-lg transition-all text-sm">
                            <Youtube className="w-4 h-4 mr-2" /> Play
                          </a>
                          {group.quiz_link && (
                            <a href={group.quiz_link} target="_blank" rel="noreferrer" className="flex-1 py-4 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white font-black rounded-2xl text-center flex items-center justify-center shadow-sm border border-blue-100 transition-all text-sm">
                              <Target className="w-4 h-4 mr-2" /> Quiz
                            </a>
                          )}
                        </div>
                      ) : isPending ? (
                        <div className="w-full py-4 bg-amber-50 text-amber-600 font-black rounded-2xl text-center border border-amber-200 flex items-center justify-center">
                          <Clock className="w-5 h-5 mr-2 animate-spin-slow" /> Pending Approval
                        </div>
                      ) : isFull ? (
                        <div className="w-full py-4 bg-slate-100 text-slate-400 font-black rounded-2xl text-center border border-slate-200 flex items-center justify-center">
                          <X className="w-5 h-5 mr-2" /> Class Full
                        </div>
                      ) : (
                        <button onClick={() => handleJoinGroup(group._id)} className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center group-hover/card:scale-105">
                          Enroll Now <ChevronRight className="w-5 h-5 ml-2" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-8 text-left">

          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 flex flex-col">
            <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center justify-between">
              Trophy Room <Award className="w-7 h-7 text-amber-500" />
            </h3>
            <div className="grid grid-cols-3 gap-4 w-full">
              {user?.badges && user.badges.length > 0 ? user.badges.slice(0, 6).map((badge, i) => (
                <div key={i} className="flex flex-col items-center group cursor-help">
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-50 to-orange-50 rounded-[1.2rem] flex items-center justify-center border border-amber-200 shadow-sm group-hover:scale-110 group-hover:-translate-y-1 transition-all">
                    <span className="text-3xl">🏆</span>
                  </div>
                  <span className="text-[10px] font-black text-amber-700 mt-3 text-center leading-tight uppercase">{badge.badgeName}</span>
                </div>
              )) : (
                <div className="col-span-3 text-center py-8 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                  <Award className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-400 font-bold text-sm">Complete sessions to unlock unique badges.</p>
                </div>
              )}
            </div>
            {user?.badges?.length > 6 && <button className="mt-6 w-full text-center text-sm font-bold text-blue-600 hover:underline">View All Badges</button>}
          </div>

          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 flex flex-col">
            <h3 className="text-xl font-black text-slate-900 mb-2 flex items-center justify-between">
              My Study Goals <CheckSquare className="w-6 h-6 text-blue-500" />
            </h3>
            <p className="text-sm text-slate-500 font-medium mb-6">Track your daily tech milestones.</p>

            <form onSubmit={handleAddGoal} className="relative mb-6">
              <input
                type="text"
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                placeholder="Add a new task..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-4 pr-12 text-sm font-bold focus:outline-none focus:border-blue-400 transition-colors"
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </form>

            <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
              {goals.length > 0 ? goals.map(goal => (
                <div key={goal.id} className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${goal.completed ? 'bg-slate-50 border-slate-100' : 'bg-white border-slate-200 hover:border-blue-200'}`}>
                  <div className="flex items-center flex-1 cursor-pointer" onClick={() => toggleGoal(goal.id)}>
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center mr-3 border-2 transition-colors ${goal.completed ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300'}`}>
                      {goal.completed && <CheckCircle className="w-3 h-3 text-white" />}
                    </div>
                    <p className={`text-sm font-bold flex-1 ${goal.completed ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{goal.text}</p>
                  </div>
                  <button onClick={() => deleteGoal(goal.id)} className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )) : (
                <p className="text-center text-slate-400 text-sm font-bold py-4">No tasks added yet.</p>
              )}
            </div>
          </div>

          <div className="bg-[#020617] rounded-[2.5rem] shadow-2xl p-1 border border-blue-500/20 group relative overflow-hidden flex flex-col">
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600 rounded-full filter blur-[80px] opacity-20 group-hover:opacity-40 transition-all duration-1000"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-600 rounded-full filter blur-[80px] opacity-10 group-hover:opacity-30 transition-all duration-1000"></div>

            <div className="relative z-10 p-8 flex flex-col h-full bg-gradient-to-br from-blue-950/50 to-transparent backdrop-blur-3xl rounded-[2.2rem]">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(96,165,250,0.8)]"></div>
                  <h3 className="text-[10px] font-black text-blue-300 uppercase tracking-[0.3em]">Operational Event</h3>
                </div>
                <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-400/20">
                  <Trophy className="w-6 h-6 text-amber-400 animate-bounce shadow-inner" />
                </div>
              </div>

              <div className="mb-8">
                <p className="text-4xl font-black text-white leading-none tracking-tighter mb-4">Monthly <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Hackathon</span></p>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-7 h-7 rounded-lg border-2 border-blue-900 bg-blue-800 flex items-center justify-center text-[8px] font-black">{i}</div>
                    ))}
                  </div>
                  <p className="text-[10px] font-bold text-blue-200/60 uppercase tracking-widest">128 Enrolled</p>
                </div>
                <p className="text-blue-100/60 text-sm font-bold leading-relaxed line-clamp-2">Engineer elite solutions, bypass complexity, and synchronize with the next-gen telemetry of development.</p>
              </div>

              <button
                onClick={handleHackathonRegister}
                className="mt-auto w-full py-5 bg-white text-blue-950 font-black rounded-2xl text-xs uppercase tracking-[0.2em] transition-all hover:bg-blue-50 hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] active:scale-[0.98] flex items-center justify-center group/hack"
              >
                Register Now <ChevronRight className="w-5 h-5 ml-2 group-hover/hack:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );

  // ---------------------------------------------------------
  // 🟢 TAB 2: MY PATH (SCHEDULE) - DOSSIER STYLE
  // ---------------------------------------------------------
  const renderSchedule = () => (
    <div className="animate-in slide-in-from-bottom-8 duration-700 text-left space-y-12 max-w-6xl mx-auto pb-12 px-4 sm:px-0">

      <div className="flex flex-col lg:flex-row justify-between lg:items-end gap-10">
        <div className="space-y-2">
          <div className="inline-flex items-center px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4 border border-blue-100 shadow-sm">
            <Activity className="w-3.5 h-3.5 mr-2" /> Learning Journey Telemetry
          </div>
          <h3 className="text-5xl font-black text-slate-900 tracking-tighter leading-none">My Path <span className="text-blue-600">Dossiers</span></h3>
          <p className="text-slate-400 font-bold text-lg max-w-xl">
            Track your enrolled sessions, curriculum progress, and academic milestones in real-time.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {groups.filter(g => g.current_members?.includes(user?._id)).map((group, index) => {
          const fillPercentage = (group.current_members.length / group.max_members) * 100;
          return (
            <div key={group._id} className="bg-white/70 backdrop-blur-md p-10 rounded-[3.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 hover:border-blue-300 transition-all duration-500 relative text-left flex flex-col group/card hover:-translate-y-2 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -z-10 group-hover/card:bg-blue-100/50 transition-colors"></div>

              <div className="flex justify-between items-start mb-8">
                <div className="px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border flex items-center bg-emerald-50 text-emerald-600 border-emerald-100">
                  <div className="w-1.5 h-1.5 rounded-full mr-2 bg-emerald-500"></div>
                  ENROLLED & ACTIVE
                </div>
                <button onClick={() => toggleBookmark(group._id)} className={`p-3 bg-white rounded-xl transition-all shadow-sm border ${bookmarked.includes(group._id) ? 'text-blue-600 border-blue-100' : 'text-slate-300 border-slate-100'}`}>
                  <Bookmark className={`w-4 h-4 ${bookmarked.includes(group._id) ? 'fill-current' : ''}`} />
                </button>
              </div>

              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-blue-600 rounded-2xl mr-5 flex items-center justify-center shadow-xl group-hover/card:scale-110 transition-transform duration-500">
                  <span className="text-white font-black text-xl">{group.module_name.charAt(0)}</span>
                </div>
                <div>
                  <h4 className="font-black text-2xl text-slate-900 tracking-tighter leading-none mb-2">{group.module_name}</h4>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center">
                    <Timer className="w-3.5 h-3.5 mr-1.5 text-blue-400" /> {group.semester || 'Series 01'} • Senior Masterclass
                  </p>
                </div>
              </div>

              <div className="flex items-center mb-10">
                <div className="flex -space-x-3 mr-4">
                  {[1, 2, 3].map((_, i) => (
                    <div key={i} className="w-10 h-10 rounded-xl border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400">
                      {i === 2 ? '+' : 'S'}
                    </div>
                  ))}
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Guidance from <span className="text-slate-900 font-black">{group.senior_id?.name || 'Mentor'}</span></p>
              </div>

              <div className="mb-10 mt-auto">
                <div className="flex justify-between items-end mb-3">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Network Bloom Status</span>
                  <span className="text-sm font-black text-blue-600">{Math.round(fillPercentage)}% Full</span>
                </div>
                <div className="w-full bg-slate-100 rounded-2xl h-3 overflow-hidden shadow-inner">
                  <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 shadow-[0_0_15px_rgba(59,130,246,0.4)] transition-all duration-1000" style={{ width: `${fillPercentage}%` }}></div>
                </div>
              </div>

              <div className="flex space-x-4">
                <a href={group.session_link} target="_blank" rel="noreferrer" className="flex-1 py-5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-[1.5rem] transition-all flex justify-center items-center shadow-xl shadow-blue-200">
                  <Youtube className="w-5 h-5 mr-3" /> Access Lab
                </a>
                <button onClick={() => {
                  const existingRating = sessionFeedback.find(f => f.sessionId === group._id)?.rating || 5;
                  setFeedbackModal({ isOpen: true, session: group, rating: existingRating, comment: '', skillMatrix: {}, isSubmitted: false });
                }} className="p-5 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white rounded-[1.5rem] transition-all border border-blue-100 group/feedback shadow-sm relative">
                  {sessionFeedback.find(f => f.sessionId === group._id) ? (
                    <div className="flex flex-col items-center">
                      <Star className="w-5 h-5 fill-current" />
                      <span className="text-[8px] font-black mt-1">{sessionFeedback.find(f => f.sessionId === group._id).rating}.0</span>
                    </div>
                  ) : (
                    group.isHackathon ? <Trophy className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />
                  )}
                </button>
                <button onClick={() => handleDropSession(group._id, group.module_name)} className="p-5 bg-blue-50 hover:bg-blue-600 text-blue-500 hover:text-white rounded-[1.5rem] transition-all border border-blue-100 shadow-sm">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          );
        })}

        {groups.filter(g => g.current_members?.includes(user?._id)).length === 0 && (
          <div className="col-span-full py-32 text-center bg-white/50 backdrop-blur rounded-[4rem] border-4 border-dashed border-slate-100 flex flex-col items-center justify-center">
            <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mb-6">
              <BookOpen className="w-12 h-12 text-slate-200" />
            </div>
            <p className="text-slate-400 font-black text-2xl uppercase tracking-tighter">Your Path is Currently Empty</p>
            <p className="text-slate-300 font-bold mt-2">Explore the dashboard and enroll in your first tech masterclass.</p>
          </div>
        )}
      </div>
    </div>
  );

  // ---------------------------------------------------------
  // 🟢 TAB 3: MENTORS UI - ELITE ROSTER
  // ---------------------------------------------------------
  const renderMentors = () => {
    const filteredMentors = globalRankedMentors.filter(m => m.name.toLowerCase().includes(mentorSearch.toLowerCase()));

    return (
      <div className="animate-in slide-in-from-right-8 duration-700 text-left space-y-12 max-w-7xl mx-auto relative pb-20">

        {/* ☄️ ELITE HEADER SECTION */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 bg-blue-950 p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] -mr-40 -mt-40 group-hover:bg-blue-600/20 transition-all duration-1000"></div>

          <div className="relative z-10">
            <div className="inline-flex items-center px-4 py-1.5 bg-blue-500/20 text-blue-300 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-6 border border-white/10">
              <ShieldCheck className="w-4 h-4 mr-2" /> Verified Network Experts
            </div>
            <h3 className="text-5xl md:text-6xl font-black text-white tracking-tighter leading-none mb-4">
              Intelligence <span className="text-blue-500">Nexus</span>
            </h3>
            <p className="text-blue-100/60 font-bold text-lg max-w-xl">
              Connect with high-velocity industry professionals, participate in technical masterclasses, and synchronize your career path.
            </p>
          </div>

          <div className="relative w-full lg:w-[450px] z-10">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-400 w-6 h-6 group-focus-within:text-white transition-colors" />
            <input
              type="text"
              value={mentorSearch}
              onChange={(e) => setMentorSearch(e.target.value)}
              placeholder="Search experts by skill or name..."
              className="w-full pl-16 pr-6 py-5 bg-white/5 border-2 border-white/10 rounded-2xl outline-none focus:bg-white/10 focus:border-blue-500/50 font-bold text-white transition-all shadow-inner placeholder-blue-300/30"
            />
          </div>
        </div>

        {/* 🗂️ MENTOR GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
          {filteredMentors.length > 0 ? filteredMentors.map((mentor) => {
            const currentRatings = mentorRatings[mentor._id] || {};
            const ratingsArray = Object.values(currentRatings);
            const avgRating = ratingsArray.length > 0
              ? (ratingsArray.reduce((s, r) => s + r, 0) / ratingsArray.length).toFixed(1)
              : "5.0";

            const myRating = currentRatings[user?._id] || 0; // Use user's own rating for star display
            const displayRating = myRating || Math.round(parseFloat(avgRating)) || 5;

            const rank = globalRankedMentors.findIndex(m => m._id === mentor._id) + 1;
            const isTop3 = rank <= 3;

            return (
              <div key={mentor._id} className="bg-white/70 backdrop-blur-xl p-10 rounded-[3.5rem] shadow-2xl shadow-slate-200/50 border border-white hover:border-blue-300 transition-all duration-500 relative flex flex-col items-center text-center group hover:-translate-y-3 overflow-hidden">

                {/* ... (rank indicator and avatar) */}
                <div className={`absolute top-0 right-0 px-6 py-3 rounded-bl-[2.5rem] text-[10px] font-black uppercase tracking-widest border-b border-l transition-colors duration-500
                  ${rank === 1 ? 'bg-amber-400 text-amber-950 border-amber-300' :
                    rank === 2 ? 'bg-slate-200 text-slate-700 border-slate-100' :
                      rank === 3 ? 'bg-orange-200 text-orange-800 border-orange-100' :
                        'bg-slate-50 text-slate-400 border-slate-100 group-hover:bg-blue-50 group-hover:text-blue-600'}`}>
                  ELITE #{rank}
                </div>

                <div className="relative mb-8 mt-4">
                  <div className={`w-32 h-32 rounded-[2.8rem] p-1.5 transition-all duration-500 group-hover:scale-105 group-hover:rotate-3 shadow-2xl
                    ${isTop3 ? 'bg-gradient-to-tr from-amber-400 via-yellow-200 to-orange-400' : 'bg-gradient-to-tr from-blue-500 to-indigo-600'}`}>
                    <div className="w-full h-full bg-white rounded-[2.4rem] overflow-hidden flex items-center justify-center text-slate-900 text-5xl font-black border-4 border-white">
                      {mentor.avatar ? <img src={mentor.avatar} alt="avatar" className="w-full h-full object-cover" /> : mentor.initial}
                    </div>
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-emerald-500 border-4 border-white p-2.5 rounded-full shadow-lg group-hover:scale-110 transition-transform">
                    <ShieldCheck className="w-5 h-5 text-white" />
                  </div>
                </div>

                <h4 className="font-black text-slate-900 text-2xl mb-1 group-hover:text-blue-600 transition-colors tracking-tight">{mentor.name}</h4>
                <div className="flex items-center space-x-2 mb-4">
                  <p className="text-[10px] text-blue-600 font-black uppercase tracking-[0.2em]">{mentor.headline || 'Lead Technical Architect'}</p>
                </div>

                {/* Telemetry Chips */}
                <div className="flex flex-wrap justify-center gap-2 mb-10">
                  <div className="px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center">
                    <Bookmark className="w-3 h-3 mr-1.5 text-blue-400" /> {Math.round(mentor.xp)} XP
                  </div>
                  <div className="px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center">
                    <Target className="w-3 h-3 mr-1.5 text-blue-400" /> {avgRating} Rating
                  </div>
                </div>

                <div className="flex items-center justify-center space-x-1.5 mb-10 bg-blue-50/50 py-3 px-6 rounded-2xl border border-blue-50/50">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} onClick={() => handleRateMentor(mentor._id, star)} className={`w-5 h-5 cursor-pointer transition-all hover:scale-125 ${star <= displayRating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                  ))}
                </div>

                <button
                  onClick={() => setContactModal({ isOpen: true, mentor: mentor, message: '', type: 'Question' })}
                  className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-[0.2em] rounded-[1.8rem] transition-all flex items-center justify-center group/intel shadow-xl shadow-blue-500/20 overflow-hidden relative"
                >
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/intel:opacity-100 transition-opacity"></div>
                  <Cpu className="w-5 h-5 mr-3 group-hover/intel:rotate-12 transition-transform" />
                  <span>Initiate Intel Link</span>
                  <ChevronRight className="w-5 h-5 ml-1.5 group-hover/intel:translate-x-2 transition-transform" />
                </button>
              </div>
            );
          }) : (
            <div className="col-span-full py-32 text-center bg-white/50 backdrop-blur-md rounded-[4rem] border-4 border-dashed border-slate-100">
              <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-slate-200" />
              </div>
              <p className="text-slate-400 font-black text-2xl uppercase tracking-tighter">No Experts Found Matching Query</p>
              <p className="text-slate-300 font-bold mt-2">Try adjusting your search filters to find available mentors.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ---------------------------------------------------------
  // 🟢 TAB 4: RANKINGS (LEADERBOARD) - PODIUM STYLE
  // ---------------------------------------------------------
  const renderLeaderboard = () => {
    // 🔴 Filter or sort logic based on rankingFilter can be added here if needed in future
    return (
      <div className="animate-in slide-in-from-right-8 duration-500 text-left space-y-12 max-w-5xl mx-auto pb-20 px-4 sm:px-0">

        {/* 🏆 LEADERBOARD HEADER */}
        <div className="text-center space-y-4 pt-12">
          <div className="inline-flex items-center px-4 py-2 bg-amber-100 text-amber-700 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4 border border-amber-200">
            <Award className="w-3 h-3 mr-2" /> Global Insight Rankings
          </div>
          <h3 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tighter leading-none mb-4">
            Network <span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">Expert Elite</span>
          </h3>
          <p className="text-gray-500 font-bold text-lg max-w-2xl mx-auto">
            Operational rankings of mentors based on hosted sessions, student sentiment, and curriculum impact.
          </p>
        </div>

        {/* 🎬 PRESTIGIOUS PODIUM (TOP 3) */}
        <div className="relative group max-w-4xl mx-auto">
          <div className="absolute -bottom-10 inset-x-0 h-20 bg-blue-500/10 blur-[100px] rounded-full"></div>

          <div className="flex flex-row justify-center items-end gap-2 md:gap-8 pt-24 pb-12 relative scale-[0.85] sm:scale-100 origin-bottom">
            {/* 🥈 2nd Place */}
            {globalRankedMentors[1] && (
              <div className="flex flex-col items-center order-2 md:order-1 relative z-10 animate-in slide-in-from-left-8 duration-700">
                <div className="relative mb-[-1rem] z-20">
                  <div className="w-24 h-24 md:w-32 md:h-32 bg-white p-1.5 rounded-[2.5rem] shadow-2xl border border-slate-200 ring-4 ring-slate-100">
                    <div className="w-full h-full bg-slate-50 rounded-[2rem] overflow-hidden flex items-center justify-center text-slate-400 font-black text-4xl border border-slate-200">
                      {globalRankedMentors[1].avatar ? <img src={globalRankedMentors[1].avatar} alt="avatar" className="w-full h-full object-cover" /> : globalRankedMentors[1].initial}
                    </div>
                  </div>
                  <div className="absolute -top-3 -left-3 w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-500 font-black text-xs shadow-lg border border-slate-200 backdrop-blur-md">2</div>
                </div>
                <div className="w-36 md:w-48 h-32 bg-gradient-to-b from-slate-200 via-slate-50 to-white rounded-t-[3rem] border border-slate-200 flex flex-col items-center justify-center pt-8">
                  <span className="text-lg font-black text-slate-800 tracking-tighter">{Math.round(globalRankedMentors[1].xp)}</span>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Expert XP</span>
                </div>
                <p className="mt-4 font-black text-slate-900 text-lg">{globalRankedMentors[1].name.split(' ')[0]}</p>
              </div>
            )}

            {/* 🥇 1st Place */}
            {globalRankedMentors[0] && (
              <div className="flex flex-col items-center order-1 md:order-2 relative z-20 animate-in slide-in-from-bottom-8 duration-1000">
                <div className="absolute -top-20 z-30"><Crown className="w-12 h-12 text-amber-500 fill-amber-500 animate-bounce" /></div>
                <div className="relative mb-[-1.5rem] z-20">
                  <div className="w-32 h-32 md:w-44 md:h-44 bg-white p-2 rounded-[3.5rem] shadow-2xl border-2 border-amber-300 ring-8 ring-amber-50">
                    <div className="w-full h-full bg-amber-50 rounded-[3rem] overflow-hidden flex items-center justify-center text-amber-600 font-black text-6xl border-2 border-amber-200">
                      {globalRankedMentors[0].avatar ? <img src={globalRankedMentors[0].avatar} alt="avatar" className="w-full h-full object-cover" /> : globalRankedMentors[0].initial}
                    </div>
                  </div>
                  <div className="absolute -top-4 -left-4 w-14 h-14 bg-amber-500 rounded-[1.5rem] flex items-center justify-center text-white font-black text-xl shadow-xl border-4 border-white rotate-[-12deg]">1</div>
                </div>
                <div className="w-44 md:w-64 h-48 bg-gradient-to-b from-amber-200 via-amber-50 to-white rounded-t-[4rem] border-2 border-amber-300/50 flex flex-col items-center justify-center pt-10 shadow-2xl relative">
                  <span className="text-3xl font-black text-amber-900 tracking-tighter">{Math.round(globalRankedMentors[0].xp)}</span>
                  <span className="text-[10px] font-black text-amber-600 uppercase tracking-[0.4em] mt-1">Apex Vector</span>
                </div>
                <p className="mt-6 font-black text-slate-950 text-2xl tracking-tighter">{globalRankedMentors[0].name.split(' ')[0]}</p>
              </div>
            )}

            {/* 🥉 3rd Place */}
            {globalRankedMentors[2] && (
              <div className="flex flex-col items-center order-3 relative z-10 animate-in slide-in-from-right-8 duration-700">
                <div className="relative mb-[-1rem] z-20">
                  <div className="w-24 h-24 md:w-32 md:h-32 bg-white p-1.5 rounded-[2.5rem] shadow-2xl border border-orange-200 ring-4 ring-orange-50">
                    <div className="w-full h-full bg-orange-50 rounded-[2rem] overflow-hidden flex items-center justify-center text-orange-400 font-black text-4xl border border-orange-200">
                      {globalRankedMentors[2].avatar ? <img src={globalRankedMentors[2].avatar} alt="avatar" className="w-full h-full object-cover" /> : globalRankedMentors[2].initial}
                    </div>
                  </div>
                  <div className="absolute -top-3 -left-3 w-10 h-10 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 font-black text-xs shadow-lg border border-orange-200 backdrop-blur-md">3</div>
                </div>
                <div className="w-36 md:w-48 h-28 bg-gradient-to-b from-orange-200 via-orange-50 to-white rounded-t-[3rem] border border-orange-200 flex flex-col items-center justify-center pt-8">
                  <span className="text-lg font-black text-orange-800 tracking-tighter">{Math.round(globalRankedMentors[2].xp)}</span>
                  <span className="text-[9px] font-black text-orange-400 uppercase tracking-widest">Impact XP</span>
                </div>
                <p className="mt-4 font-black text-slate-900 text-lg">{globalRankedMentors[2].name.split(' ')[0]}</p>
              </div>
            )}
          </div>
        </div>

        {/* 📋 DETAILED LIST */}
        <div className="bg-white rounded-[3.5rem] shadow-2xl shadow-blue-100/50 border border-gray-100 overflow-hidden mt-10">
          <div className="px-10 py-8 bg-[#0f172a] text-white flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10">
                <BarChart3 className="w-6 h-6 text-blue-400" />
              </div>
              <div className="text-left">
                <h4 className="font-black text-xl tracking-tight leading-none">Global Ranks</h4>
                <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest mt-1">Live Intelligence Feed</p>
              </div>
            </div>
            <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
              <button onClick={() => setRankingFilter('mentors')} className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${rankingFilter === 'mentors' ? 'bg-white text-slate-900 shadow-lg' : 'text-blue-300 hover:text-white'}`}>Mentors</button>
              <button onClick={() => setRankingFilter('topics')} className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${rankingFilter === 'topics' ? 'bg-white text-slate-900 shadow-lg' : 'text-blue-300 hover:text-white'}`}>By Topic</button>
            </div>
          </div>

          <div className="p-4 sm:p-6 space-y-4 bg-gray-50/30">
            {globalRankedMentors.map((mentor, index) => {
              const rank = index + 1;
              return (
                <div key={mentor.id} className="relative flex items-center p-6 bg-white rounded-[2.5rem] border border-gray-100 hover:shadow-xl hover:border-blue-100 hover:-translate-y-1 transition-all duration-300 group">
                  <div className="w-12 flex items-center justify-center mr-6 shrink-0 font-black text-xl text-slate-300">
                    {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank}
                  </div>
                  <div className="w-16 h-16 rounded-[1.5rem] flex items-center justify-center font-black text-2xl mr-6 transition-all duration-500 overflow-hidden shrink-0 border border-gray-100 group-hover:scale-110">
                    {mentor.avatar ? <img src={mentor.avatar} alt="avatar" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-blue-100 text-blue-600 flex items-center justify-center">{mentor.initial}</div>}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-black text-xl text-slate-900 leading-none mb-1.5">{mentor.name}</p>
                    <div className="flex items-center space-x-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <span className="flex items-center"><ShieldCheck className="w-3 h-3 mr-1 text-emerald-500" /> {mentor.level}</span>
                      <span className="flex items-center"><Star className="w-3 h-3 mr-1 text-amber-400" /> Elite Elite</span>
                    </div>
                  </div>
                  <div className="text-right ml-4 shrink-0">
                    <div className="flex items-center justify-end space-x-2">
                      <p className="font-black text-4xl text-slate-900 tracking-tighter group-hover:text-blue-600 transition-colors">{Math.round(mentor.xp)}</p>
                      <TrendingUp className="w-5 h-5 text-emerald-500 opacity-50" />
                    </div>
                    <div className="w-32 bg-gray-100 h-1.5 rounded-full mt-2 overflow-hidden shadow-inner">
                      <div className="h-full rounded-full bg-gradient-to-r from-blue-400 to-indigo-500" style={{ width: `${Math.min((mentor.xp / 5000) * 100, 100)}%` }}></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // ---------------------------------------------------------
  // 🟢 TAB 6: NEW INBOX / MESSAGES UI FOR JUNIOR
  // ---------------------------------------------------------
  const renderInbox = () => (
    <div className="animate-in slide-in-from-right-8 duration-500 text-left space-y-10 max-w-5xl mx-auto pb-12 px-4 sm:px-0">

      {/* 📡 INBOX HEADER */}
      <div className="bg-gradient-to-br from-blue-800 to-indigo-900 rounded-[3.5rem] p-12 text-white shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[80px] -mr-20 -mt-20 group-hover:bg-blue-500/20 transition-all duration-700"></div>
        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          <div className="w-28 h-28 bg-white/10 rounded-[2.2rem] flex items-center justify-center border border-white/20 backdrop-blur-xl shadow-inner">
            <Inbox className="w-14 h-14 text-blue-300 animate-pulse" />
          </div>
          <div className="text-left">
            <div className="inline-flex items-center px-4 py-1.5 bg-blue-500/20 text-blue-200 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4 border border-white/10">
              <Activity className="w-3 h-3 mr-2" /> Live Connection Feed
            </div>
            <h3 className="text-5xl font-black mb-3 tracking-tighter leading-none">Command <span className="text-blue-400">Inbox</span></h3>
            <p className="text-blue-200/70 font-medium text-lg leading-relaxed max-w-xl">
              Synthesize expert guidance, track your mentorship inquiries, and manage your intelligence exchange in real-time.
            </p>
          </div>
        </div>
      </div>

      {/* ✉️ MESSAGES AREA */}
      <div className="bg-white rounded-[4rem] shadow-2xl shadow-blue-100/50 border border-gray-100 p-6 sm:p-10 min-h-[600px] relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-bl-[10rem] -z-10"></div>

        {myMessages.length > 0 ? (
          <div className="space-y-12">
            {myMessages.map(msg => {
              const thread = getThread(msg);
              const unread = !msg.readByJunior && msg.reply !== null;
              return (
                <div key={msg.id} className={`group/msg relative p-8 rounded-[3rem] border-2 transition-all duration-500 ${unread ? 'border-blue-400 bg-blue-50/20 shadow-xl' : 'border-gray-50 bg-white/50 hover:bg-white hover:border-blue-100 hover:shadow-xl'}`}>

                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 pb-6 border-b border-gray-100/80 gap-4">
                    <div className="flex items-center space-x-5">
                      <div className="w-16 h-16 rounded-2xl bg-blue-600 border border-white shadow-xl flex items-center justify-center p-0.5 overflow-hidden">
                        <div className="w-full h-full bg-blue-600 flex items-center justify-center text-white font-black text-xl leading-none">{msg.receiverName.charAt(0)}</div>
                      </div>
                      <div className="text-left">
                        <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1 flex items-center">
                          <ShieldCheck className="w-3 h-3 mr-2" /> Expert Verification • {msg.type}
                        </p>
                        <h4 className="text-xl font-black text-slate-900 tracking-tight leading-none">{msg.receiverName}</h4>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 w-full sm:w-auto self-end sm:self-center">
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest mr-2">{new Date(msg.timestamp).toLocaleDateString()}</span>
                      {unread && (
                        <button onClick={() => markReplyAsRead(msg.id)} className="px-4 py-2 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/30 hover:bg-blue-500 transition-all text-[9.5px] font-black uppercase tracking-widest active:scale-95 leading-none">
                          Absorb Intel & Read
                        </button>
                      )}
                      <button onClick={() => handleDeleteMessage(msg.id)} className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all" title="Archive Thread">
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-8 max-h-[500px] overflow-y-auto px-2 custom-scrollbar-blue flex flex-col text-left">
                    <div className="flex flex-col items-end group/bubble w-full animate-in fade-in slide-in-from-right-4 duration-500">
                      <div className="bg-blue-600 text-white px-7 py-6 rounded-[2.5rem] rounded-tr-lg shadow-xl text-left relative max-w-[90%] sm:max-w-[75%] border border-white/10">
                        {editingMsgId === msg.id ? (
                          <div className="space-y-4">
                            <textarea value={editingText} onChange={(e) => setEditingText(e.target.value)} className="w-full bg-white/10 border-2 border-white/20 rounded-2xl p-4 text-sm font-bold text-white focus:outline-none focus:border-blue-400 mb-2 min-h-[100px]" />
                            <div className="flex justify-end space-x-2">
                              <button onClick={() => setEditingMsgId(null)} className="px-4 py-2 bg-white/10 text-[10px] font-black uppercase rounded-lg">Cancel</button>
                              <button onClick={() => saveEditedMessage(msg.id)} className="px-4 py-2 bg-blue-600 text-[10px] font-black uppercase rounded-lg">Save</button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="text-sm font-semibold leading-relaxed tracking-wide">{msg.text}</p>
                            <div className="mt-4 flex items-center opacity-40 text-[9px] font-black uppercase tracking-widest">
                              <Clock className="w-2.5 h-2.5 mr-1" /> My Brief • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <button onClick={() => startEditingMessage(msg)} className="absolute -left-12 top-0 p-3 text-slate-200 opacity-0 group-hover/bubble:opacity-100 transition-opacity hover:text-blue-400"><Edit3 className="w-5 h-5" /></button>
                          </>
                        )}
                      </div>
                    </div>

                    {thread.map((reply, i) => {
                      const isMe = reply.senderId === user?._id;
                      return (
                        <div key={reply.id || i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-left-4 duration-500 w-full`}>
                          <div className={`px-7 py-6 rounded-[2.5rem] ${isMe ? 'bg-blue-950 text-white rounded-tr-lg border border-white/5' : 'bg-slate-100 text-slate-900 rounded-tl-lg border border-slate-200'} max-w-[90%] sm:max-w-[75%] shadow-sm relative group/subreply`}>
                            <p className="text-sm font-medium leading-relaxed">{reply.text}</p>
                            <div className="mt-3 flex items-center opacity-40 text-[9px] font-black uppercase tracking-widest">
                              <Clock className="w-2.5 h-2.5 mr-1" /> {reply.senderName} • {new Date(reply.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            {isMe && (
                              <div className="absolute -left-16 top-0 flex space-x-1 opacity-0 group-hover/subreply:opacity-100 transition-opacity">
                                <button onClick={() => handleDeleteThreadReply(msg.id, reply.id)} className="p-2 text-slate-300 hover:text-blue-600"><Trash2 className="w-4 h-4" /></button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    <div className="flex flex-col items-end w-full mt-10 pt-10 border-t-2 border-dashed border-slate-100">
                      {replyingTo === msg.id ? (
                        <div className="bg-white border-4 border-blue-100 p-8 rounded-[3.5rem] rounded-tr-2xl shadow-[0_40px_100px_-20px_rgba(37,99,235,0.25)] w-full max-w-[95%] animate-in slide-in-from-bottom-6 relative">
                          <div className="absolute top-0 right-10 -translate-y-1/2 bg-blue-600 p-4 rounded-2xl shadow-xl shadow-blue-500/50 leading-none">
                            <Zap className="w-6 h-6 text-white" />
                          </div>

                          <div className="flex items-center mb-6">
                            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mr-4">
                              <CornerDownRight className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="text-left">
                              <h5 className="font-black text-slate-900 leading-none mb-1">Follow-up Inquiry</h5>
                              <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Drafting reply to {msg.receiverName}</p>
                            </div>
                          </div>

                          <textarea
                            className="w-full bg-slate-50 border-2 border-slate-200 rounded-[2rem] p-7 text-sm font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-blue-400 mb-6 resize-none transition-all placeholder-slate-400 min-h-[150px] shadow-inner"
                            placeholder="Draft your inquiry follow-up here..."
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            autoFocus
                          />

                          <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
                            <div className="flex items-center bg-blue-50 px-5 py-3 rounded-2xl border border-blue-100">
                              <Activity className={`w-4 h-4 mr-2 ${replyText.length > 400 ? 'text-amber-500 animate-bounce' : 'text-blue-400'}`} />
                              <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">{replyText.length} / 500 Tokens</span>
                            </div>

                            <div className="flex space-x-3 w-full sm:w-auto">
                              <button onClick={() => { setReplyingTo(null); setReplyText(''); }} className="flex-1 sm:flex-none px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-all leading-none">Abort Draft</button>
                              <button onClick={() => handleThreadReply(msg.id)} disabled={!replyText.trim() || replyText.length > 500} className="flex-1 sm:flex-none px-12 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-2xl shadow-blue-500/40 hover:-translate-y-1 transition-all group-disabled:opacity-50 flex items-center justify-center overflow-hidden leading-none relative">
                                <span className="relative z-10 flex items-center">Broadcast Intel <Send className="w-4 h-4 ml-3" /></span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <button onClick={() => { setReplyingTo(msg.id); setReplyText(""); }} className="group relative pr-10 pl-6 py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-[1.8rem] transition-all duration-500 flex items-center shadow-xl shadow-blue-900/20 hover:-translate-y-1">
                          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center mr-4 group-hover:bg-white group-hover:text-blue-600 transition-colors">
                            <MessageSquare className="w-5 h-5" />
                          </div>
                          <span className="font-black text-xs uppercase tracking-widest">Interface Response</span>
                          <div className="absolute right-6 group-hover:translate-x-2 transition-transform">
                            <ChevronRight className="w-5 h-5 text-blue-400" />
                          </div>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-24 flex flex-col items-center justify-center animate-in fade-in duration-1000">
            <div className="w-32 h-32 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200 flex items-center justify-center mb-8">
              <Mail className="w-14 h-14 text-slate-300" />
            </div>
            <h4 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-3">Void Detected</h4>
            <p className="text-slate-400 font-bold text-lg max-w-sm text-center">Your messaging hub is currently clear. No active intelligence streams found.</p>
          </div>
        )}
      </div>
    </div>
  );

  // ---------------------------------------------------------
  // 🟢 TAB 5: PREMIUM SETTINGS UI FOR JUNIOR
  // ---------------------------------------------------------
  const renderSettings = () => (
    <div className="animate-in slide-in-from-right-8 duration-700 text-left space-y-12 max-w-5xl mx-auto pb-12 px-4 sm:px-0">

      {/* ⚙️ SETTINGS HEADER */}
      <div className="bg-gradient-to-br from-blue-800 to-indigo-900 rounded-[3.5rem] p-12 text-white shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-[70px] -mr-16 -mt-16 group-hover:bg-blue-500/20 transition-all duration-700"></div>
        <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
          <div className="w-28 h-28 bg-white/10 rounded-[2.5rem] flex items-center justify-center border border-white/20 backdrop-blur-xl shadow-inner">
            <Settings className="w-14 h-14 text-blue-300 animate-spin-slow" />
          </div>
          <div className="text-left">
            <div className="inline-flex items-center px-4 py-1.5 bg-blue-500/20 text-blue-200 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4 border border-white/10 shadow-sm leading-none">
              <ShieldCheck className="w-4 h-4 mr-2" /> Learning Profile Intelligence
            </div>
            <h3 className="text-5xl font-black mb-3 tracking-tighter leading-none">Command <span className="text-blue-400">Settings</span></h3>
            <p className="text-blue-200/70 font-medium text-lg leading-relaxed max-w-xl">
              Configure your operational profile, security protocols, and system alert preferences.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* 📟 SIDE NAVIGATION */}
        <div className="w-full lg:w-80 space-y-4">
          {[
            { id: 'profile', label: 'Learner Profile', icon: User },
            { id: 'security', label: 'Access Protocols', icon: Key },
            { id: 'notifications', label: 'Alert Center', icon: BellRing }
          ].map(tab => {
            const isActive = settingsTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSettingsTab(tab.id)}
                className={`flex items-center w-full px-8 py-6 rounded-[2.5rem] font-black transition-all duration-500 border-none outline-none group relative overflow-hidden leading-none ${isActive ? 'bg-blue-600 text-white shadow-2xl translate-x-2' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
              >
                {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-blue-400 rounded-r-full"></div>}
                <div className={`p-3 rounded-2xl mr-5 transition-all duration-500 ${isActive ? 'bg-blue-500/20 text-blue-300 scale-110 shadow-lg shadow-blue-900/50' : 'bg-slate-100 group-hover:bg-white shadow-sm'}`}>
                  <tab.icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-blue-300' : 'text-slate-400'}`} />
                </div>
                <span className="whitespace-nowrap text-sm uppercase tracking-widest">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* 📂 CONTENT AREA */}
        <div className="flex-1 bg-white/70 backdrop-blur-xl rounded-[4rem] shadow-2xl shadow-blue-100/30 border border-blue-50 p-8 sm:p-14 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-bl-full -z-10 opacity-30 transform translate-x-10 -translate-y-10"></div>

          {settingsTab === 'profile' && (
            <div className="animate-in fade-in duration-700">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-10 mb-14">
                <div className="relative group">
                  <div className="absolute -inset-2 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-[3.5rem] opacity-20 blur-lg group-hover:opacity-40 transition-opacity"></div>
                  <div className="w-40 h-40 rounded-[3rem] bg-blue-600 flex items-center justify-center text-white text-6xl font-black shadow-2xl overflow-hidden border-4 border-white relative z-10 transition-transform hover:scale-105 duration-500">
                    {user?.avatar ? <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" /> : (user?.name?.charAt(0).toUpperCase() || 'U')}
                  </div>
                  <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} className="hidden" accept="image/*" />
                  <button onClick={() => fileInputRef.current.click()} className="absolute -bottom-4 -right-4 p-4 bg-blue-600 text-white rounded-2xl shadow-xl border-2 border-white hover:bg-blue-500 hover:scale-110 transition-all z-20 shadow-blue-500/50">
                    <Camera className="w-6 h-6" />
                  </button>
                </div>
                <div className="text-center sm:text-left mt-4 sm:mt-0 pt-4 flex flex-col items-center sm:items-start justify-center">
                  <h4 className="text-4xl font-black text-slate-900 tracking-tighter mb-2 leading-none">{user?.name || 'Explorer'}</h4>
                  <p className="text-slate-400 font-bold mb-6 text-xl leading-none">{user?.email}</p>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                    <span className="px-5 py-2.5 bg-blue-50 text-blue-600 text-[9px] font-black uppercase tracking-[0.2em] rounded-2xl border border-blue-100 flex items-center shadow-sm leading-none"><ShieldCheck className="w-3.5 h-3.5 mr-2" /> Verified Learner</span>
                    <span className="px-5 py-2.5 bg-blue-800 text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-2xl border border-blue-700 flex items-center shadow-lg leading-none"><Sparkles className="w-3.5 h-3.5 mr-2 text-blue-400" /> Active Student</span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleProfileUpdate} className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-4 text-left">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2 block leading-none">Full Designation</label>
                    <div className="relative group/input">
                      <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within/input:text-blue-500 transition-colors" />
                      <input type="text" value={profileData.name} onChange={(e) => setProfileData({ ...profileData, name: e.target.value })} className="w-full pl-16 pr-6 py-5 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold text-slate-900 focus:bg-white focus:border-blue-400 shadow-sm outline-none transition-all placeholder-slate-300" placeholder="Student Name" />
                    </div>
                  </div>
                  <div className="space-y-4 text-left">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2 block leading-none">Curriculum Industry</label>
                    <div className="relative group/input">
                      <Globe className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within/input:text-blue-500 transition-colors" />
                      <input type="text" value={profileData.industry} onChange={(e) => setProfileData({ ...profileData, industry: e.target.value })} placeholder="e.g. Computer Science, Digital Arts" className="w-full pl-16 pr-6 py-5 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold text-slate-900 focus:bg-white focus:border-blue-400 shadow-sm outline-none transition-all placeholder-slate-300" />
                    </div>
                  </div>
                  <div className="space-y-4 md:col-span-2 text-left">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2 block leading-none">Professional Headline</label>
                    <div className="relative group/input">
                      <Briefcase className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within/input:text-blue-500 transition-colors" />
                      <input type="text" value={profileData.headline} onChange={(e) => setProfileData({ ...profileData, headline: e.target.value })} placeholder="e.g. Aspiring Full Stack Developer | UI/UX Enthusiast" className="w-full pl-16 pr-6 py-5 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold text-slate-900 focus:bg-white focus:border-blue-400 shadow-sm outline-none transition-all placeholder-slate-300" />
                    </div>
                  </div>
                  <div className="space-y-4 md:col-span-2 text-left">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2 block leading-none">Mentorship Intelligence Dossier (Bio)</label>
                    <textarea rows="5" value={profileData.bio} onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })} placeholder="Synthesize your learning goals and historical impact..." className="w-full p-8 bg-slate-50 border-2 border-slate-50 rounded-3xl font-bold text-slate-900 focus:bg-white focus:border-blue-400 shadow-sm outline-none transition-all resize-none placeholder-slate-300 min-h-[160px]"></textarea>
                  </div>
                  <div className="space-y-4 md:col-span-2 text-left">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2 block leading-none">Learning Interest Dossier (CSV)</label>
                    <div className="relative group/input">
                      <Code className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within/input:text-blue-500 transition-colors" />
                      <input type="text" value={profileData.interests} onChange={(e) => setProfileData({ ...profileData, interests: e.target.value })} placeholder="React, Python, Cloud Architect..." className="w-full pl-16 pr-6 py-5 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold text-slate-900 focus:bg-white focus:border-blue-400 shadow-sm outline-none transition-all placeholder-slate-300" />
                    </div>
                  </div>
                </div>
                <div className="pt-8 flex justify-end">
                  <button type="submit" disabled={isSavingProfile} className="px-12 py-5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-[0.2em] rounded-[1.8rem] shadow-2xl transition-all flex items-center hover:-translate-y-1 disabled:opacity-50 leading-none shadow-blue-500/40">
                    {isSavingProfile ? 'Synchronizing...' : 'Update Intelligence Docket'} <Save className="w-5 h-5 ml-4" />
                  </button>
                </div>
              </form>
            </div>
          )}

          {settingsTab === 'security' && (
            <div className="animate-in fade-in duration-700 space-y-12">
              <div className="flex items-center gap-6 p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 text-left">
                <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center">
                  <Lock className="w-7 h-7 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-2">Access Protocols</h4>
                  <p className="text-slate-400 font-bold text-sm">Update your encryption keys to maintain operational security.</p>
                </div>
              </div>
              <form onSubmit={handlePasswordUpdate} className="space-y-10 max-w-xl text-left">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2 block leading-none">Current Encryption Key</label>
                  <div className="relative group/input">
                    <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within/input:text-blue-500 transition-colors" />
                    <input
                      required
                      type="password"
                      placeholder="••••••••"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className="w-full pl-16 pr-6 py-5 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold text-slate-900 focus:bg-white focus:border-blue-400 shadow-sm outline-none transition-all placeholder-slate-300"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2 block leading-none">New Encryption Key</label>
                  <div className="relative group/input">
                    <Key className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within/input:text-blue-500 transition-colors" />
                    <input
                      required
                      type="password"
                      placeholder="••••••••"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="w-full pl-16 pr-6 py-5 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold text-slate-900 focus:bg-white focus:border-blue-400 shadow-sm outline-none transition-all placeholder-slate-300"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2 block leading-none">Confirm New Key</label>
                  <div className="relative group/input">
                    <ShieldAlert className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within/input:text-blue-500 transition-colors" />
                    <input
                      required
                      type="password"
                      placeholder="••••••••"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="w-full pl-16 pr-6 py-5 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold text-slate-900 focus:bg-white focus:border-blue-400 shadow-sm outline-none transition-all placeholder-slate-300"
                    />
                  </div>
                </div>
                <div className="pt-8">
                  <button type="submit" disabled={isSavingPassword} className="px-12 py-5 bg-slate-900 hover:bg-blue-600 text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl transition-all flex items-center hover:-translate-y-1 disabled:opacity-50 leading-none">
                    {isSavingPassword ? 'Recalibrating...' : 'Update Access Protocol'} <Zap className="w-5 h-5 ml-4 text-blue-400" />
                  </button>
                </div>
              </form>
            </div>
          )}

          {settingsTab === 'notifications' && (
            <div className="animate-in fade-in duration-700 space-y-12 text-left">
              <div className="flex items-center gap-6 p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center">
                  <BellRing className="w-7 h-7 text-amber-600" />
                </div>
                <div>
                  <h4 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-2">Alert Parameters</h4>
                  <p className="text-slate-400 font-bold text-sm">Calibrate how the system communicates operational updates.</p>
                </div>
              </div>

              <div className="space-y-6">
                {[
                  { label: 'Public Profile Visibility', desc: 'Allow your expert dossier to be discoverable in global search vectors.', state: profilePublic, toggle: () => setProfilePublic(!profilePublic), icon: Globe },
                  { label: 'Direct Intelligence Alerts', desc: 'Receive immediate email notifications when students request a tactical join.', state: emailNotif, toggle: () => setEmailNotif(!emailNotif), icon: Mail },
                  { label: 'Device Push Protocols', desc: 'Enable push notifications for real-time mission updates and messages.', state: pushNotif, toggle: () => setPushNotif(!pushNotif), icon: Smartphone }
                ].map((item, i) => (
                  <div key={i} onClick={item.toggle} className={`flex items-center justify-between p-8 bg-white border rounded-[2rem] hover:shadow-xl hover:shadow-slate-100 transition-all group cursor-pointer duration-500 ${item.state ? 'border-blue-200 shadow-blue-50' : 'border-slate-100'}`}>
                    <div className="flex items-center gap-6">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${item.state ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600'}`}>
                        <item.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-black text-slate-900 uppercase tracking-widest text-xs mb-1">{item.label}</p>
                        <p className="text-slate-400 font-bold text-xs">{item.desc}</p>
                      </div>
                    </div>
                    <div className="relative inline-flex items-center cursor-pointer group/switch">
                      <div className={`w-16 h-8 rounded-full shadow-inner transition-all duration-500 relative ${item.state ? 'bg-blue-600' : 'bg-slate-200'}`}>
                        <div className={`w-6 h-6 bg-white rounded-full absolute top-1 shadow-md transition-all duration-500 ${item.state ? 'right-1' : 'left-1'}`}></div>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="pt-10 flex justify-end">
                  <button onClick={handleSavePreferences} disabled={isSavingPreferences} className="px-10 py-5 bg-slate-900 hover:bg-blue-600 text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl shadow-2xl transition-all flex items-center hover:-translate-y-1 disabled:opacity-50 group/save">
                    {isSavingPreferences ? 'Synchronizing...' : 'Save Parameters'} <Save className="w-5 h-5 ml-4 group-hover/save:scale-110 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderFeedbackModal = () => (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-[#0f172a]/80 backdrop-blur-md transition-all text-left">
      <div className="bg-white rounded-[3.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">
        {!feedbackModal.isSubmitted ? (
          <>
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-10 text-white relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full mix-blend-overlay filter blur-[40px] opacity-10"></div>
              <button onClick={() => setFeedbackModal({ ...feedbackModal, isOpen: false, isSubmitted: false })} className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"><X className="w-5 h-5" /></button>
              <h3 className="text-4xl font-black mb-2 tracking-tighter">Session Feedback</h3>
              <p className="text-blue-100 font-bold opacity-80 uppercase text-[10px] tracking-[0.2em]">Post-Mission Analysis</p>
            </div>

            <div className="p-10 bg-slate-50">
              <p className="text-slate-500 font-bold mb-6 text-sm">How was your technical experience with <span className="text-slate-900">{feedbackModal.session?.module_name}</span>?</p>

              <div className="flex justify-center space-x-3 mb-10">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onClick={() => setFeedbackModal({ ...feedbackModal, rating: star })}
                    className="p-1 group/star transition-all active:scale-95"
                  >
                    <Star className={`w-12 h-12 transition-all duration-300 ${star <= feedbackModal.rating ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]' : 'text-slate-200 group-hover/star:text-slate-300'}`} />
                  </button>
                ))}
              </div>

              <div className="mb-10">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Intelligence Report</label>
                <textarea
                  value={feedbackModal.comment}
                  onChange={(e) => setFeedbackModal({ ...feedbackModal, comment: e.target.value })}
                  placeholder="Share your detailed thoughts or technical challenges..."
                  className="w-full h-40 bg-white border border-slate-200 rounded-[1.5rem] p-6 font-bold text-slate-800 focus:outline-none focus:border-blue-400 shadow-sm transition-all resize-none"
                />
              </div>

              <div className="flex gap-4">
                <button onClick={() => setFeedbackModal({ ...feedbackModal, isOpen: false, isSubmitted: false })} className="flex-1 py-4 bg-slate-200 text-slate-500 font-black rounded-2xl transition-all hover:bg-slate-300">Dismiss</button>
                <button
                  onClick={handleSubmitFeedback}
                  disabled={isSubmittingFeedback}
                  className="flex-[2] py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-200 transition-all hover:bg-blue-700 flex items-center justify-center disabled:opacity-50"
                >
                  {isSubmittingFeedback ? (
                    <div className="flex items-center"><Clock className="w-5 h-5 mr-2 animate-spin-slow" /> Processing...</div>
                  ) : (
                    <>Submit Analysis <Send className="w-4 h-4 ml-2" /></>
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="p-20 text-center flex flex-col items-center bg-white animate-in zoom-in-95">
            <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-[2.5rem] flex items-center justify-center mb-6 shadow-inner animate-bounce">
              <CheckCheck className="w-12 h-12" />
            </div>

            {/* ⭐ Display the submitted rating stars */}
            <div className="flex space-x-1 mb-6">
              {[1, 2, 3, 4, 5].map(star => (
                <Star key={star} className={`w-8 h-8 ${star <= feedbackModal.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-100'}`} />
              ))}
            </div>

            <h3 className="text-3xl font-black text-slate-900 mb-2 uppercase tracking-tighter">Analysis Uploaded</h3>
            <p className="text-slate-500 font-bold mb-10">Your <span className="text-blue-600 font-black">{feedbackModal.rating}-Star</span> technical feedback has been synchronized.</p>
            <button
              onClick={() => setFeedbackModal({ isOpen: false, session: null, rating: 5, comment: '', skillMatrix: {}, isSubmitted: false })}
              className="px-16 py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl hover:scale-105 transition-all"
            >
              Back to Command
            </button>
          </div>
        )}
      </div>
    </div>
  );

  if (!user || loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
      <div className="flex flex-col items-center">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <p className="mt-4 text-blue-900 font-bold tracking-widest text-sm uppercase animate-pulse">Loading Workspace...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col w-full max-w-full overflow-x-hidden nexus-mesh font-sans text-slate-800 selection:bg-blue-100 selection:text-blue-900 relative">
      <style>{`
        ${sharedStyles}
        .sn-slide { animation: snSlide .4s cubic-bezier(0.16,1,0.3,1) both; }
        .sn-dot { width:8px; height:8px; border-radius:99px; cursor:pointer; transition:all .3s ease; border:none; padding:0; }
        .sn-dot.active { width:24px; background:white !important; }
        .sn-dot:not(.active) { background:rgba(255,255,255,0.35); }
        
        .nexus-mesh {
          background-color: #F4F7FE;
          background-image: 
            radial-gradient(at 0% 0%, rgba(79, 70, 229, 0.05) 0px, transparent 50%),
            radial-gradient(at 100% 0%, rgba(59, 130, 246, 0.05) 0px, transparent 50%),
            radial-gradient(at 100% 100%, rgba(79, 70, 229, 0.05) 0px, transparent 50%),
            radial-gradient(at 0% 100%, rgba(59, 130, 246, 0.05) 0px, transparent 50%);
          background-attachment: fixed;
        }

        .glass-premium {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.5);
        }

        .floating-action-shadow {
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.1), 0 5px 15px rgba(0, 0, 0, 0.05);
        }
      `}</style>

      {/* 🚀 FIXED GLOBAL NAVIGATION */}
      <div className="w-full z-[250] fixed top-0 left-0">
        <Navbar />
      </div>

      {/* Main Layout Container (Offset for Fixed Navbar) */}
      <div className="flex flex-1 w-full relative pt-[68px]">

        {/* 🟢 MODERN EXPANDING SIDEBAR (Kuppi Space Style) */}
        <aside
          onMouseEnter={() => setSidebarOpen(true)}
          onMouseLeave={() => setSidebarOpen(false)}
          className="fixed top-[68px] left-0 h-[calc(100vh-68px)] ml-6 bg-white/90 backdrop-blur-xl rounded-[2.5rem] hidden md:flex flex-col justify-between shadow-[0_10px_40px_rgba(0,0,0,0.04)] z-[150] border border-white py-6 overflow-hidden transition-all duration-300"
          style={{ width: sidebarOpen ? '240px' : '78px' }}
        >
          <div className="flex flex-col w-full">
            <div className="flex flex-col w-full px-3 gap-2 mt-4">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                { id: 'schedule', label: 'My Path', icon: BookOpen },
                { id: 'mentors', label: 'Mentors', icon: UserCheck },
                { id: 'leaderboard', label: 'Rankings', icon: Award },
                { id: 'inbox', label: 'Messages', icon: Inbox, badge: unreadRepliesCount },
                { id: 'settings', label: 'Settings', icon: Settings },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative flex items-center w-full px-4 py-4 rounded-2xl text-sm font-bold transition-all border-none outline-none group/link ${activeTab === item.id ? 'bg-[#1e3a8a] text-white shadow-md' : 'text-slate-500 hover:bg-blue-50 hover:text-blue-600'}`}
                >
                  <item.icon className="w-5 h-5 shrink-0" />
                  <span className={`ml-4 whitespace-nowrap transition-all duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
                    {item.label}
                  </span>
                  {item.badge > 0 && (
                    <span className={`absolute right-4 text-[10px] px-2 py-0.5 rounded-full font-black shrink-0 transition-opacity ${sidebarOpen ? 'opacity-100' : 'opacity-0'} ${activeTab === item.id ? 'bg-white text-[#1e3a8a]' : 'bg-blue-500 text-white animate-pulse'}`}>
                      {item.badge}
                    </span>
                  )}
                  {!sidebarOpen && <span className="absolute left-full ml-4 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover/link:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-xl border border-white/10">
                    {item.label}
                  </span>}
                </button>
              ))}
            </div>
          </div>

          <div className="px-3 w-full mt-auto">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-4 text-sm text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-2xl font-bold transition-all border-none outline-none group/logout"
            >
              <LogOut className="w-5 h-5 shrink-0" />
              <span className={`ml-4 whitespace-nowrap transition-all duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
                Sign Out
              </span>
              {!sidebarOpen && <span className="absolute left-full ml-4 px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg opacity-0 group-hover/logout:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-xl">
                Sign Out
              </span>}
            </button>
          </div>
        </aside>

        <main className={`flex-1 flex flex-col w-full relative z-10 min-h-screen transition-all duration-300 ${sidebarOpen ? 'md:pl-[280px]' : 'md:pl-[120px]'}`}>
          <header className="h-28 flex items-center justify-between px-8 sticky top-[68px] z-[100] glass-premium transition-all shadow-sm">
            <div className="relative w-[28rem] hidden sm:block group">
              <Search className="w-5 h-5 absolute left-5 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
              <input
                type="text"
                value={exploreSearch}
                onChange={handleGlobalSearch}
                placeholder="Search experts, classes, settings..."
                className="w-full pl-14 pr-4 py-4 bg-white border-2 border-transparent focus:border-blue-200 rounded-2xl outline-none text-sm font-bold text-slate-700 shadow-sm transition-all focus:shadow-md"
              />
            </div>

            <div className="flex items-center space-x-6 ml-auto">
              <div className="hidden lg:flex items-center px-5 py-3 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 rounded-2xl shadow-sm cursor-help hover:scale-105 transition-transform">
                <Flame className="w-5 h-5 text-orange-500 mr-2 animate-pulse" />
                <span className="text-sm font-black text-orange-700">5 Day Streak!</span>
              </div>

              <div className="relative">
                <button onClick={handleToggleNotifications} className={`relative p-4 transition-all duration-300 bg-white rounded-2xl shadow-sm border ${showNotifs ? 'text-blue-600 border-blue-200' : 'text-slate-400 border-slate-100 hover:border-blue-100 hover:scale-105 active:scale-95'}`}>
                  <BellRing className={`w-6 h-6 ${showNotifs ? 'animate-none' : 'hover:animate-swing'}`} />
                  {unreadRepliesCount > 0 && (
                    <div className="absolute top-3 right-3 flex items-center justify-center">
                      <span className="absolute w-3.5 h-3.5 bg-blue-500 rounded-full border-2 border-white animate-ping opacity-75"></span>
                      <span className="relative w-3.5 h-3.5 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center text-[7px] font-black text-white">
                        {unreadRepliesCount}
                      </span>
                    </div>
                  )}
                </button>

                {showNotifs && (
                  <div className="absolute top-16 right-0 w-80 bg-white rounded-[2rem] shadow-2xl border border-slate-100 p-5 z-50 animate-in slide-in-from-top-4">
                    <div className="flex items-center justify-between mb-4 px-2">
                      <h4 className="font-black text-slate-900 text-lg">Alerts</h4>
                      <button onClick={() => setShowNotifs(false)} className="text-xs text-blue-600 font-bold hover:underline">Close</button>
                    </div>
                    {unreadRepliesCount > 0 ? (
                      <div onClick={() => { setActiveTab('inbox'); setShowNotifs(false); }} className="p-4 bg-blue-50 rounded-2xl border border-blue-100 mb-3 cursor-pointer hover:bg-blue-100 transition-colors">
                        <p className="text-sm font-black text-blue-900 flex items-center"><MessageSquare className="w-4 h-4 mr-2" /> {unreadRepliesCount} New Mentor Replies!</p>
                        <p className="text-xs font-bold text-blue-600 mt-2 leading-relaxed">Click here to read your messages in the Inbox.</p>
                      </div>
                    ) : (
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors">
                        <p className="text-sm font-black text-slate-800 flex items-center"><Sparkles className="w-4 h-4 mr-2 text-amber-500" /> Welcome to Kuppi Space!</p>
                        <p className="text-xs font-bold text-slate-500 mt-2 leading-relaxed">You're all caught up on your notifications.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="relative">
                <div onClick={() => setShowProfile(!showProfile)} className={`flex items-center p-2 pr-6 bg-white rounded-[1.5rem] shadow-sm border cursor-pointer hover:shadow-md transition-all ${showProfile ? 'border-blue-300' : 'border-slate-100 hover:border-blue-100'}`}>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-violet-500 flex items-center justify-center text-white font-black text-xl mr-4 shadow-inner overflow-hidden">
                    {user?.avatar ? <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" /> : (user?.name ? user.name.charAt(0).toUpperCase() : 'U')}
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-black text-slate-900 leading-tight">{user?.name ? user.name.split(' ')[0] : 'Student'}</p>
                    <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest mt-0.5">Learner</p>
                  </div>
                </div>

                {showProfile && (
                  <div className="absolute top-20 right-0 w-64 bg-white rounded-[2rem] shadow-2xl border border-slate-100 p-3 z-50 animate-in slide-in-from-top-4">
                    <div className="flex items-center p-4 mb-2 bg-slate-50 rounded-2xl">
                      <div className="w-14 h-14 bg-blue-100 rounded-xl text-blue-600 flex items-center justify-center font-black text-2xl mr-4 overflow-hidden border border-blue-200">
                        {user?.avatar ? <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" /> : (user?.name ? user.name.charAt(0).toUpperCase() : 'U')}
                      </div>
                      <div>
                        <p className="font-black text-slate-900 leading-tight text-lg truncate w-28">{user?.name ? user.name.split(' ')[0] : 'Student'}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Free Tier</p>
                      </div>
                    </div>
                    <div className="px-2 pb-2">
                      <button onClick={() => { setActiveTab('settings'); setShowProfile(false); }} className="w-full text-left px-4 py-3 rounded-xl text-slate-700 font-bold hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center text-sm">
                        <User className="w-4 h-4 mr-3" /> My Profile
                      </button>
                    </div>
                    <hr className="border-slate-100 mb-2" />
                    <button onClick={handleLogout} className="w-full text-left px-5 py-4 rounded-xl text-[#1e3a8a] font-black hover:bg-blue-50 transition-colors flex items-center text-sm">
                      <LogOut className="w-5 h-5 mr-3" /> Secure Log Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          <div className="p-8 pt-6 max-w-7xl mx-auto w-full relative pb-20">
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'schedule' && renderSchedule()}
            {activeTab === 'mentors' && renderMentors()}
            {activeTab === 'leaderboard' && renderLeaderboard()}
            {activeTab === 'inbox' && renderInbox()}
            {activeTab === 'settings' && renderSettings()}
          </div>
        </main>
      </div>

      {/* Final Global Footer */}
      <div className="w-full relative z-[200]">
        <Footer />
      </div>

      {/* 🔴 EXPLORE SESSIONS MODAL */}
      {isExploreOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 sm:p-8 bg-blue-950/90 backdrop-blur-2xl transition-all">
          <div className="bg-blue-950/90 border border-blue-500/30 rounded-[3rem] w-full max-w-6xl h-[85vh] flex flex-col shadow-[0_0_100px_rgba(37,99,235,0.3)] overflow-hidden relative animate-in zoom-in-95 duration-300">
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-600/30 rounded-full mix-blend-screen filter blur-[120px] -z-10 animate-pulse"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-violet-600/20 rounded-full mix-blend-screen filter blur-[120px] -z-10 animate-pulse"></div>

            <div className="p-8 md:p-12 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 bg-white/5 relative z-10 backdrop-blur-md">
              <div className="text-left w-full md:w-auto">
                <h2 className="text-4xl md:text-5xl font-black text-white mb-2 flex items-center"><Zap className="w-10 h-10 mr-4 text-blue-400" /> Global Intelligence Hub</h2>
                <p className="text-blue-200 font-medium text-lg ml-14">Synchronize with experts, dossiers, and neural platform settings.</p>
              </div>
              <button onClick={() => setIsExploreOpen(false)} className="absolute top-8 right-8 p-3 bg-white/10 hover:bg-blue-600 hover:text-white rounded-full text-blue-200 transition-colors"><X className="w-6 h-6" /></button>
              <div className="w-full md:w-96 relative group mt-4 md:mt-0">
                <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-blue-300 w-5 h-5 group-focus-within:text-white transition-colors" />
                <input type="text" value={exploreSearch} onChange={(e) => setExploreSearch(e.target.value)} placeholder="Search skills, topics..." className="w-full bg-black/50 border border-blue-500/50 rounded-2xl py-4 pl-14 pr-4 text-white placeholder-blue-300/70 focus:outline-none focus:border-blue-300 focus:bg-white/10 transition-all font-bold shadow-inner" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 md:p-12 no-scrollbar relative z-10 space-y-16">

              {/* 🕹️ SECTION 0: SYSTEM COMMANDS (Navigation) */}
              {[
                { id: 'dashboard', label: 'Dashboard', keywords: ['dash', 'home', 'main'] },
                { id: 'schedule', label: 'My Path', keywords: ['path', 'schedule', 'sessions', 'my'] },
                { id: 'mentors', label: 'Mentors', keywords: ['expert', 'mentor', 'teacher', 'coach'] },
                { id: 'leaderboard', label: 'Rankings', keywords: ['rank', 'lead', 'score', 'trophy'] },
                { id: 'inbox', label: 'Messages', keywords: ['mail', 'msg', 'inbox', 'chat'] },
                { id: 'settings', label: 'Settings', keywords: ['set', 'pref', 'profile', 'edit'] }
              ].filter(nav => nav.label.toLowerCase().includes(exploreSearch.toLowerCase()) || nav.keywords.some(k => k.includes(exploreSearch.toLowerCase()))).length > 0 && (
                  <div className="space-y-6">
                    <div className="flex items-center space-x-4 border-l-4 border-amber-500 pl-6">
                      <h3 className="text-3xl font-black text-white uppercase tracking-tighter">System Navigation</h3>
                      <div className="h-px flex-1 bg-gradient-to-r from-amber-500/50 to-transparent"></div>
                    </div>
                    <div className="flex flex-wrap gap-4">
                      {[
                        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                        { id: 'schedule', label: 'My Path', icon: BookOpen },
                        { id: 'mentors', label: 'Mentors', icon: UserCheck },
                        { id: 'leaderboard', label: 'Rankings', icon: Award },
                        { id: 'inbox', label: 'Messages', icon: Inbox },
                        { id: 'settings', label: 'Settings', icon: Settings }
                      ].filter(nav => nav.label.toLowerCase().includes(exploreSearch.toLowerCase()) || ['dash', 'home', 'main', 'path', 'schedule', 'sessions', 'my', 'expert', 'mentor', 'teacher', 'coach', 'rank', 'lead', 'score', 'trophy', 'mail', 'msg', 'inbox', 'chat', 'set', 'pref', 'profile', 'edit'].some(k => nav.label.toLowerCase().includes(k) && k.includes(exploreSearch.toLowerCase()))).map(nav => (
                        <button key={nav.id} onClick={() => { setActiveTab(nav.id); setIsExploreOpen(false); }} className="px-8 py-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-200 font-black hover:bg-amber-500 hover:text-white transition-all flex items-center shadow-lg shadow-amber-500/10 group/nav">
                          <nav.icon className="w-5 h-5 mr-3 group-hover/nav:scale-110 transition-transform" /> {nav.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              {/* 🎯 SECTION 1: PERSONAL OBJECTIVES (Goals) */}
              {goals.filter(g => g.text.toLowerCase().includes(exploreSearch.toLowerCase())).length > 0 && (
                <div className="space-y-6">
                  <div className="flex items-center space-x-4 border-l-4 border-emerald-500 pl-6">
                    <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Personal Objectives</h3>
                    <div className="h-px flex-1 bg-gradient-to-r from-emerald-500/50 to-transparent"></div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {goals.filter(g => g.text.toLowerCase().includes(exploreSearch.toLowerCase())).map(goal => (
                      <div key={goal.id} onClick={() => { setActiveTab('dashboard'); setIsExploreOpen(false); }} className="bg-white/5 border border-emerald-500/20 p-6 rounded-[2rem] hover:bg-emerald-500/10 transition-all cursor-pointer group/goal">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${goal.completed ? 'bg-emerald-500 text-white' : 'bg-white/10 text-emerald-400'}`}>
                              <Target className="w-6 h-6" />
                            </div>
                            <h4 className={`font-bold text-white transition-all ${goal.completed ? 'opacity-50 line-through' : 'group-hover/goal:text-emerald-400'}`}>{goal.text}</h4>
                          </div>
                          <ChevronRight className="w-5 h-5 text-emerald-500/50 group-hover/goal:translate-x-1 transition-all" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 👨‍🏫 SECTION 1: MATCHING EXPERTS */}
              {mentors.filter(m => m.name.toLowerCase().includes(exploreSearch.toLowerCase()) || m.headline?.toLowerCase().includes(exploreSearch.toLowerCase())).length > 0 && (
                <div className="space-y-8">
                  <div className="flex items-center space-x-4 border-l-4 border-blue-500 pl-6">
                    <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Elite Expert Roster</h3>
                    <div className="h-px flex-1 bg-gradient-to-r from-blue-500/50 to-transparent"></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {mentors.filter(m => m.name.toLowerCase().includes(exploreSearch.toLowerCase()) || m.headline?.toLowerCase().includes(exploreSearch.toLowerCase())).map((mentor) => (
                      <div key={mentor._id} onClick={() => { setActiveTab('mentors'); setIsExploreOpen(false); setMentorSearch(mentor.name); }} className="bg-white/5 border border-white/10 p-6 rounded-[2rem] hover:bg-white/10 transition-all cursor-pointer group/mentor">
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-2xl overflow-hidden border-2 border-white/20">
                            {mentor.avatar ? <img src={mentor.avatar} alt="avatar" className="w-full h-full object-cover" /> : mentor.name.charAt(0)}
                          </div>
                          <div className="text-left">
                            <h4 className="font-black text-white text-lg leading-tight group-hover/mentor:text-blue-400 transition-colors">{mentor.name}</h4>
                            <p className="text-[10px] text-blue-200/50 font-bold uppercase tracking-widest mt-1 line-clamp-1">{mentor.headline || 'Technical Architect'}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 📚 SECTION 2: MASTERCLASS DOSSIERS */}
              <div className="space-y-8">
                <div className="flex items-center space-x-4 border-l-4 border-indigo-500 pl-6">
                  <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Knowledge Dossiers</h3>
                  <div className="h-px flex-1 bg-gradient-to-r from-indigo-500/50 to-transparent"></div>
                </div>
                {groups.filter(group => group.module_name.toLowerCase().includes(exploreSearch.toLowerCase()) || group.semester.toLowerCase().includes(exploreSearch.toLowerCase())).length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {groups.filter(group => group.module_name.toLowerCase().includes(exploreSearch.toLowerCase()) || group.semester.toLowerCase().includes(exploreSearch.toLowerCase())).map((group) => {
                      const isPending = group.pending_members?.some(id => id._id === user?._id || id === user?._id);
                      const isEnrolled = group.current_members?.includes(user?._id);
                      const isFull = group.current_members.length >= group.max_members;
                      const fillPercentage = (group.current_members.length / group.max_members) * 100;
                      const isSaved = bookmarked.includes(group._id);

                      return (
                        <div key={group._id} className="bg-white/5 border border-white/10 hover:bg-white/10 p-8 rounded-[2.5rem] transition-all duration-300 backdrop-blur-md flex flex-col text-left group/card hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)] hover:border-blue-400/50 relative">
                          <button onClick={() => toggleBookmark(group._id)} className={`absolute top-8 right-8 p-2 rounded-xl transition-colors ${isSaved ? 'bg-blue-500 text-white' : 'bg-white/10 text-slate-400 hover:text-white hover:bg-white/20'}`}><Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} /></button>
                          <div className="flex justify-between items-start mb-6"><span className="px-4 py-2 bg-blue-500/20 text-blue-200 border border-blue-500/30 text-xs font-black rounded-xl uppercase tracking-widest">{group.semester || 'Masterclass'}</span></div>
                          <h4 className="font-black text-white text-3xl mb-4 leading-tight group-hover/card:text-blue-200 transition-colors pr-10">{group.module_name}</h4>
                          <div className="flex items-center mb-8">
                            <div className="w-10 h-10 rounded-full bg-blue-500/30 text-blue-200 flex items-center justify-center font-black text-sm mr-3 border border-blue-400/30">{group.senior_id?.name ? group.senior_id.name.charAt(0).toUpperCase() : 'E'}</div>
                            <p className="text-blue-200/80 font-bold text-sm">By {group.senior_id?.name || 'Expert'}</p>
                          </div>
                          <div className="mt-auto">
                            <div className="flex justify-between text-xs font-black mb-3 text-blue-200 uppercase"><span>Capacity</span><span className={fillPercentage >= 100 ? 'text-amber-400' : 'text-white'}>{group.current_members.length} / {group.max_members}</span></div>
                            <div className="w-full bg-black/50 rounded-full h-2.5 mb-8 overflow-hidden border border-white/5"><div className={`h-full rounded-full transition-all duration-1000 ${fillPercentage >= 100 ? 'bg-amber-500' : 'bg-gradient-to-r from-blue-400 to-indigo-400'}`} style={{ width: `${fillPercentage}%` }}></div></div>
                            {isEnrolled ? (
                              <div className="flex space-x-3">
                                <a href={group.session_link} target="_blank" rel="noreferrer" className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl flex items-center justify-center transition-all shadow-lg text-sm"><Youtube className="w-5 h-5 mr-2" /> Watch</a>
                                {group.quiz_link && <a href={group.quiz_link} target="_blank" rel="noreferrer" className="flex-1 py-4 bg-white/10 hover:bg-white/20 text-white font-black rounded-2xl flex items-center justify-center transition-all shadow-lg text-sm"><Target className="w-5 h-5 mr-2" /> Exam</a>}
                              </div>
                            ) : isPending ? (
                              <button className="w-full py-4 bg-amber-500/20 text-amber-300 font-black rounded-2xl flex items-center justify-center border border-amber-500/30 cursor-default"><Clock className="w-5 h-5 mr-2 animate-spin-slow" /> Request Sent</button>
                            ) : isFull ? (
                              <button className="w-full py-4 bg-white/5 text-slate-500 font-black rounded-2xl flex items-center justify-center border border-white/10 cursor-not-allowed"><X className="w-5 h-5 mr-2" /> Class Full</button>
                            ) : (
                              <button onClick={() => handleJoinGroup(group._id)} className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center group-hover/card:scale-105">Apply Now <ChevronRight className="w-5 h-5 ml-2" /></button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="w-24 h-24 bg-white/5 rounded-[2rem] flex items-center justify-center mb-6 border border-white/10"><Filter className="w-10 h-10 text-blue-300/50" /></div>
                    <h3 className="text-3xl font-black text-white mb-2">No Results Found</h3>
                    <p className="text-blue-200 font-medium text-lg">Try searching with a different skill or topic.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🔴 GLOBAL CONTACT MENTOR MODAL */}
      {contactModal.isOpen && contactModal.mentor && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-[#0f172a]/70 backdrop-blur-md transition-all text-left">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 border border-white/20">
            {!msgSuccess ? (
              <>
                <div className="bg-gradient-to-r from-blue-600 to-violet-600 p-10 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full mix-blend-overlay filter blur-[40px] opacity-20"></div>
                  <button onClick={() => setContactModal({ isOpen: false, mentor: null, message: '', type: 'Question' })} className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"><X className="w-5 h-5" /></button>
                  <div className="flex items-center relative z-10">
                    <div className="w-20 h-20 bg-white rounded-[1.5rem] flex items-center justify-center text-blue-600 font-black text-3xl mr-6 shadow-inner overflow-hidden border-4 border-blue-400/30">
                      {contactModal.mentor.avatar ? <img src={contactModal.mentor.avatar} alt="avatar" className="w-full h-full object-cover" /> : (contactModal.mentor.initial || (contactModal.mentor.name && contactModal.mentor.name.charAt(0)) || 'M')}
                    </div>
                    <div>
                      <p className="text-blue-200 font-bold text-xs uppercase tracking-widest mb-1">Direct Message</p>
                      <h3 className="text-3xl font-black">{contactModal.mentor.name.split(' ')[0]}</h3>
                    </div>
                  </div>
                </div>
                <form onSubmit={handleSendContact} className="p-10 bg-slate-50">
                  <div className="mb-6">
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Message Type</label>
                    <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
                      {['Question', 'Feedback', '1-on-1 Request'].map(type => (
                        <button key={type} type="button" onClick={() => setContactModal({ ...contactModal, type })} className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all border-none outline-none ${contactModal.type === type ? 'bg-blue-50 text-blue-600 shadow-sm border border-blue-100' : 'bg-transparent text-slate-500 hover:bg-slate-50'}`}>
                          {type === 'Question' ? '🤔' : type === 'Feedback' ? '⭐' : '📅'} {type.split(' ')[0]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {(contactModal.type === '1-on-1 Request' || contactModal.type === 'Request Pairing') && (
                    <div className="mb-8 animate-in slide-in-from-top-2">
                      <label className="block text-xs font-black text-blue-600 uppercase tracking-widest mb-3 flex items-center">
                        <Target className="w-4 h-4 mr-2" /> Defined Outcome (What do you want to achieve?)
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={contactModal.definedOutcomes || ''}
                          onChange={(e) => setContactModal({ ...contactModal, definedOutcomes: e.target.value })}
                          placeholder="e.g. Master React Hooks, Prep for Mock Interview"
                          className="w-full bg-blue-50 border-2 border-blue-100 rounded-2xl py-4 px-5 font-bold text-slate-800 focus:outline-none focus:border-blue-400 shadow-sm transition-all"
                        />
                      </div>
                      <p className="text-[10px] text-blue-400 font-bold mt-2 italic">* This goal helps the mentor prepare for your session.</p>
                    </div>
                  )}

                  <div className="mb-8">
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Your Message</label>
                    <textarea
                      value={contactModal.message}
                      onChange={(e) => setContactModal({ ...contactModal, message: e.target.value })}
                      className="w-full h-40 bg-white border border-slate-200 rounded-[1.5rem] p-6 font-bold text-slate-800 focus:outline-none focus:border-blue-400 shadow-sm transition-all resize-none"
                      placeholder={contactModal.type === 'Request Pairing' ? "Tell them a bit about your background and why you think they are a good match..." : "Type your message here..."}
                    />
                  </div>

                  <div className="flex gap-4">
                    <button type="button" onClick={() => setContactModal({ isOpen: false, mentor: null, message: '', type: 'Question' })} className="flex-1 py-4 bg-slate-100 text-slate-500 font-black rounded-2xl transition-all hover:bg-slate-200">Dismiss</button>
                    <button type="submit" disabled={isSendingMsg || contactModal.message.length > 300} className="flex-[2] py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all flex items-center justify-center disabled:opacity-50">
                      {isSendingMsg ? 'Sending...' : 'Execute Link'} <Send className="w-4 h-4 ml-2" />
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="p-20 text-center bg-white flex flex-col items-center">
                <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-[2rem] flex items-center justify-center mb-8 animate-bounce">
                  <CheckCheck className="w-12 h-12" />
                </div>
                <h3 className="text-3xl font-black text-slate-900 mb-3 uppercase tracking-tighter">Transmission Successful</h3>
                <p className="text-slate-500 font-bold mb-8">Your inquiry has been encrypted and sent to {contactModal.mentor.name}.</p>
                <button onClick={() => { setMsgSuccess(false); setContactModal({ isOpen: false, mentor: null, message: '', type: 'Question' }); }} className="px-12 py-4 bg-slate-900 text-white font-black rounded-2xl hover:scale-105 transition-all">Close Dossier</button>
              </div>
            )}
          </div>
        </div>
      )}

      {feedbackModal.isOpen && renderFeedbackModal()}

    </div>
  );
};

export default JuniorDashboard; 
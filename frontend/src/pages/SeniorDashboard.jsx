import { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import {
  BookOpen, Calendar, Users, BarChart3,
  LogOut, Bell, Search, Settings, Star, Clock,
  ChevronRight, Plus, CheckCircle, Target, Zap,
  TrendingUp, Sparkles, UserPlus, X, LayoutTemplate, UserMinus, Award,
  Edit3, Trash2, Youtube, LayoutDashboard, ShieldCheck, ShieldAlert, Mail, Briefcase, Code,
  Camera, Key, Smartphone, Globe, Lock, User, BellRing, Save, CheckSquare,
  MessageSquare, Activity, Share2, Lightbulb, Timer, CalendarDays, Inbox, CornerDownRight, Send, CheckCheck, PlayCircle, Youtube as YoutubeIcon, ChevronLeft, Compass, Crown
} from 'lucide-react';
import { T, Icon, sharedStyles } from '../components/resources/theme.jsx';


const HERO_SLIDES = [
  { type: 'text' },
  {
    type: 'image',
    src: '/kuppi-mentor-bg.png',
    title: 'Learn Together',
    subtitle: 'Access thousands of peer-shared notes, slides and past papers — curated and reviewed by your community.',
    badge: '🎓 Senior Community',
  },
  {
    type: 'image',
    src: '/kuppi-mentor1-bg.png',
    title: 'Share Your Expertise',
    subtitle: 'Upload lecture slides, notes and resources. Track ratings and downloads from your students in real time.',
    badge: '👨‍🏫 Expert Portal',
  },
];

const SeniorDashboard = () => {
  const [user, setUser] = useState(null);
  const [greeting, setGreeting] = useState('');
  const [myGroups, setMyGroups] = useState([]);
  const [globalMentors, setGlobalMentors] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔴 TABS STATE
  const [activeTab, setActiveTab] = useState('dashboard');

  // 🔴 SEARCH STATES
  const [globalSearch, setGlobalSearch] = useState('');
  const [sessionSearch, setSessionSearch] = useState('');

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
    skills: '', industry: '', languages: 'English'
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // 🔴 MENTOR TASKS (Local Storage)
  const [mentorTasks, setMentorTasks] = useState(() => {
    const saved = localStorage.getItem('mentorTasks');
    return saved ? JSON.parse(saved) : [
      { id: 1, text: 'Review pending requests for Masterclass', completed: false },
      { id: 2, text: 'Upload recording for Advanced React', completed: true },
      { id: 3, text: 'Grade weekend assignment', completed: false }
    ];
  });
  const [newTask, setNewTask] = useState('');

  // 🔴 LIVE COUNTDOWN TIMER STATE
  const [liveSession, setLiveSession] = useState(() => {
    const saved = localStorage.getItem('liveSession');
    return saved ? JSON.parse(saved) : null;
  });
  const [timerModalOpen, setTimerModalOpen] = useState(false);
  const [timerForm, setTimerForm] = useState({ module_name: '', targetDate: '' });
  const [timeLeft, setTimeLeft] = useState({ days: '00', hours: '00', mins: '00', secs: '00' });

  // 🔴 CONTINUOUS INBOX MESSAGES (Local Storage)
  const [platformMessages, setPlatformMessages] = useState(() => {
    const saved = localStorage.getItem('platformMessages');
    return saved ? JSON.parse(saved) : [];
  });

  // Thread Reply States
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');

  // Reply Editing States (CRUD)
  const [editingReplyId, setEditingReplyId] = useState(null);
  const [editReplyText, setEditReplyText] = useState('');

  // Modals States
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 🔔 NOTIFICATION LOGIC: Mark as Seen
  const handleToggleNotifications = () => {
    if (!showNotifs) {
      // Transitioning to shown: Mark all current unread as read
      const updatedMessages = platformMessages.map(m => {
        if (m.receiverId === user?._id && (m.readBySenior === false || m.readBySenior === undefined)) {
          return { ...m, readBySenior: true };
        }
        return m;
      });
      setPlatformMessages(updatedMessages);
      localStorage.setItem('platformMessages', JSON.stringify(updatedMessages));
    }
    setShowNotifs(!showNotifs);
  };
  const [formData, setFormData] = useState({
    module_name: '', max_members: 50, session_link: '', semester: '', quiz_link: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🔴 NEW: Creative Quiz Toggle States
  const [showQuizInput, setShowQuizInput] = useState(false);
  const [showEditQuizInput, setShowEditQuizInput] = useState(false);

  const [editModal, setEditModal] = useState({ isOpen: false, groupId: null, formData: null });
  const [isUpdating, setIsUpdating] = useState(false);

  const [manageModal, setManageModal] = useState({ isOpen: false, group: null, students: [], isLoading: false });

  // 🔴 NEW: Carousel & Sidebar states
  const [heroSlide, setHeroSlide] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
      if (userRole === 'junior' || userRole === 'student') {
        navigate('/junior-dashboard', { replace: true });
        return;
      }

      setUser(parsedUser);
      setProfileData({
        name: parsedUser.name || '',
        headline: parsedUser.headline || '',
        bio: parsedUser.bio || ''
      });
      fetchMentorData(parsedUser.token);
    } else {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    localStorage.setItem('mentorTasks', JSON.stringify(mentorTasks));
  }, [mentorTasks]);

  // Sync Messages periodically to get replies in real-time
  useEffect(() => {
    const interval = setInterval(() => {
      const saved = localStorage.getItem('platformMessages');
      if (saved) setPlatformMessages(JSON.parse(saved));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Auto-advance hero carousel every 5s
  useEffect(() => {
    if (activeTab !== 'dashboard') return;
    const t = setInterval(() => setHeroSlide(s => (s + 1) % HERO_SLIDES.length), 6000);
    return () => clearInterval(t);
  }, [activeTab]);

  // TIMER EFFECT LOGIC
  useEffect(() => {
    localStorage.setItem('liveSession', JSON.stringify(liveSession));

    if (!liveSession || !liveSession.targetDate) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const target = new Date(liveSession.targetDate).getTime();
      const distance = target - now;

      if (distance < 0) {
        clearInterval(interval);
        setTimeLeft({ days: '00', hours: '00', mins: '00', secs: '00' });
        return;
      }

      setTimeLeft({
        days: String(Math.floor(distance / (1000 * 60 * 60 * 24))).padStart(2, '0'),
        hours: String(Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(2, '0'),
        mins: String(Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0'),
        secs: String(Math.floor((distance % (1000 * 60)) / 1000)).padStart(2, '0')
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [liveSession]);

  const fetchMentorData = async (token) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token || JSON.parse(localStorage.getItem('userInfo')).token}` } };

      const profileRes = await axios.get('http://localhost:5001/api/auth/profile', config);
      const dbRole = profileRes.data.role?.toLowerCase();
      if (dbRole === 'junior' || dbRole === 'student') {
        navigate('/junior-dashboard', { replace: true });
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
        skills: Array.isArray(profileRes.data.skills) ? profileRes.data.skills.join(', ') : '',
        industry: profileRes.data.industry || '',
        languages: Array.isArray(profileRes.data.languages) ? profileRes.data.languages.join(', ') : 'English'
      }));

      // Sync preferences
      setProfilePublic(profileRes.data.profilePublic ?? true);
      setEmailNotif(profileRes.data.emailNotif ?? true);
      setPushNotif(profileRes.data.pushNotif ?? false);

      const groupRes = await axios.get('http://localhost:5001/api/groups', config);
      setMyGroups(groupRes.data.reverse());

      const mentorRes = await axios.get('http://localhost:5001/api/auth/mentors', config);
      setGlobalMentors(mentorRes.data);

    } catch (error) {
      console.error("Error fetching mentor data:", error);
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('userInfo');
        navigate('/login', { replace: true });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSetTimer = (e) => {
    e.preventDefault();
    setLiveSession({
      module_name: timerForm.module_name,
      targetDate: timerForm.targetDate
    });
    setTimerModalOpen(false);
    alert("⏱️ Live session countdown successfully updated!");
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    setMentorTasks([{ id: Date.now(), text: newTask, completed: false }, ...mentorTasks]);
    setNewTask('');
  };

  const toggleTask = (id) => {
    setMentorTasks(mentorTasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id) => {
    setMentorTasks(mentorTasks.filter(t => t.id !== id));
  };

  // 🔴 MENTOR CONTINUOUS REPLY LOGIC (Thread)
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
          readByJunior: false, // Notify Junior
          readBySenior: true
        };
      }
      return m;
    });

    setPlatformMessages(updatedMessages);
    localStorage.setItem('platformMessages', JSON.stringify(updatedMessages));
    setReplyingTo(null);
    setReplyText('');
  };

  const handleDeleteMessage = (id) => {
    const confirmDel = window.confirm("🗑️ Are you sure you want to permanently delete this entire conversation?");
    if (!confirmDel) return;
    const updated = platformMessages.filter(m => m.id !== id);
    setPlatformMessages(updated);
    localStorage.setItem('platformMessages', JSON.stringify(updated));
  };

  const markAsRead = (msgId) => {
    const updated = platformMessages.map(m => m.id === msgId ? { ...m, readBySenior: true } : m);
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
    setEditingReplyId(null);
    setEditReplyText('');
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

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const userInfoStr = localStorage.getItem('userInfo');
      const token = userInfoStr ? JSON.parse(userInfoStr).token : '';
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const dataToSave = {
        ...profileData,
        skills: profileData.skills.split(',').map(s => s.trim()).filter(s => s !== ''),
        languages: profileData.languages.split(',').map(l => l.trim()).filter(l => l !== '')
      };

      const response = await axios.put('http://localhost:5001/api/auth/profile', dataToSave, config);

      setUser(prev => ({ ...prev, ...response.data }));

      if (userInfoStr) {
        const parsed = JSON.parse(userInfoStr);
        Object.assign(parsed, response.data);
        localStorage.setItem('userInfo', JSON.stringify(parsed));
      }

      alert("✅ Expert Profile updated and synced with cloud!");
    } catch (error) {
      alert("⚠️ Failed to update profile. Please try again.");
      console.error(error);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const userInfoStr = localStorage.getItem('userInfo');
      const token = userInfoStr ? JSON.parse(userInfoStr).token : '';
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const dataToSend = { ...formData, senior_id: user._id };
      const response = await axios.post('http://localhost:5001/api/groups/create', dataToSend, config);
      alert(`🎉 Session created! You earned +500 XP!`);
      setIsModalOpen(false);
      setFormData({ module_name: '', max_members: 10, session_link: '', semester: '', quiz_link: '' });
      setShowQuizInput(false);
      fetchMentorData(token);
    } catch (error) {
      alert(`⚠️ ${error.response?.data?.message || "Failed to create session"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (group) => {
    setEditModal({
      isOpen: true, groupId: group._id,
      formData: { module_name: group.module_name, max_members: group.max_members, session_link: group.session_link, semester: group.semester, quiz_link: group.quiz_link || '' }
    });
    setShowEditQuizInput(!!group.quiz_link);
  };

  const handleUpdateSession = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const userInfoStr = localStorage.getItem('userInfo');
      const token = userInfoStr ? JSON.parse(userInfoStr).token : '';
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const response = await axios.put(`http://localhost:5001/api/groups/update/${editModal.groupId}`, editModal.formData, config);
      alert(`✅ ${response.data.message}`);
      setEditModal({ isOpen: false, groupId: null, formData: null });
      fetchMentorData(token);
    } catch (error) {
      alert(`⚠️ ${error.response?.data?.message || "Failed to update session"}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteSession = async (groupId, moduleName) => {
    const confirmDelete = window.confirm(`⚠️ Warning! Are you sure you want to completely delete the session "${moduleName}"? This action cannot be undone.`);
    if (!confirmDelete) return;
    try {
      const userInfoStr = localStorage.getItem('userInfo');
      const token = userInfoStr ? JSON.parse(userInfoStr).token : '';
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const response = await axios.delete(`http://localhost:5001/api/groups/delete/${groupId}`, config);
      alert(`🗑️ ${response.data.message}`);
      fetchMentorData(token);
    } catch (error) {
      alert(`⚠️ ${error.response?.data?.message || "Failed to delete session"}`);
    }
  };

  const handleApproveRequest = async (groupId, studentId) => {
    try {
      const userInfoStr = localStorage.getItem('userInfo');
      const token = userInfoStr ? JSON.parse(userInfoStr).token : '';
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const response = await axios.put(`http://localhost:5001/api/groups/approve/${groupId}/${studentId}`, {}, config);
      alert(`✅ Student approved! You earned +150 XP!`);
      fetchMentorData(token);
    } catch (error) {
      alert(`⚠️ ${error.response?.data?.message || "Failed to approve request"}`);
    }
  };

  const handleRejectRequest = async (groupId, studentId) => {
    const confirmReject = window.confirm("❌ Are you sure you want to reject this request?");
    if (!confirmReject) return;
    try {
      const userInfoStr = localStorage.getItem('userInfo');
      const token = userInfoStr ? JSON.parse(userInfoStr).token : '';
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const response = await axios.delete(`http://localhost:5001/api/groups/reject/${groupId}/${studentId}`, config);
      alert(`🗑️ ${response.data.message}`);
      fetchMentorData(token);
    } catch (error) {
      alert(`⚠️ ${error.response?.data?.message || "Failed to reject request"}`);
    }
  };

  const handleDownloadStudents = () => {
    const { students, group } = manageModal;
    if (!students || students.length === 0) {
      alert("⚠️ No students found to export.");
      return;
    }

    // Modern CSV generation logic
    const header = "Student Name,Email,Badges Awarded,XP Points\n";
    const rows = students.map(s =>
      `"${s.name}","${s.email}",${s.badges?.length || 0},${s.xp || 0}`
    ).join("\n");

    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `SkillNest_Export_${group.module_name}_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleManageStudents = async (group) => {
    setManageModal({ isOpen: true, group: group, students: [], isLoading: true });
    try {
      const userInfoStr = localStorage.getItem('userInfo');
      const token = userInfoStr ? JSON.parse(userInfoStr).token : '';
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const response = await axios.get(`http://localhost:5001/api/groups/${group._id}/students`, config);
      setManageModal(prev => ({ ...prev, students: response.data, isLoading: false }));
    } catch (error) {
      console.error("Failed to fetch students:", error);
      setManageModal(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleAwardBadge = async (studentId, studentName, moduleName) => {
    const defaultBadgeName = `${moduleName.split(' - ')[0]} Expert`;
    const badgeName = window.prompt(`🏆 Enter Badge Name to award ${studentName}:`, defaultBadgeName);
    if (!badgeName) return;
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const response = await axios.post(`http://localhost:5001/api/auth/award-badge/${studentId}`, { badgeName }, config);
      alert(`🎉 ${response.data.message}`);
      setManageModal(prev => ({
        ...prev,
        students: prev.students.map(student => {
          if (student._id === studentId) {
            const currentBadges = student.badges || [];
            return { ...student, badges: [...currentBadges, { _id: Date.now().toString(), badgeName }] };
          }
          return student;
        })
      }));
    } catch (error) {
      console.error("Award badge error:", error.response);
      alert(`⚠️ ${error.response?.data?.message || "Failed to award badge"}`);
    }
  };

  const handleUpdateBadge = async (studentId, badgeId, currentName) => {
    const newBadgeName = window.prompt(`🔄 Update Badge Name (Current: ${currentName}):`, currentName);
    if (!newBadgeName || newBadgeName === currentName) return;
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const response = await axios.put(`http://localhost:5001/api/auth/update-badge/${studentId}/${badgeId}`, { badgeName: newBadgeName }, config);
      alert(`✅ ${response.data.message}`);
      setManageModal(prev => ({
        ...prev,
        students: prev.students.map(student => {
          if (student._id === studentId) {
            return { ...student, badges: student.badges.map(b => b._id === badgeId ? { ...b, badgeName: newBadgeName } : b) };
          }
          return student;
        })
      }));
    } catch (error) {
      alert("⚠️ Failed to update badge");
    }
  };

  const handleDeleteBadge = async (studentId, badgeId, badgeName) => {
    const confirmDelete = window.confirm(`❌ Are you sure you want to remove the '${badgeName}' badge?`);
    if (!confirmDelete) return;
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const response = await axios.delete(`http://localhost:5001/api/auth/delete-badge/${studentId}/${badgeId}`, config);
      alert(`✅ ${response.data.message}`);
      setManageModal(prev => ({
        ...prev,
        students: prev.students.map(student => {
          if (student._id === studentId) {
            return { ...student, badges: student.badges.filter(b => b._id !== badgeId) };
          }
          return student;
        })
      }));
    } catch (error) {
      alert("⚠️ Failed to delete badge");
    }
  };

  const handleRemoveStudent = async (studentId, studentName) => {
    const confirmRemove = window.confirm(`❌ Are you sure you want to remove ${studentName}?`);
    if (!confirmRemove) return;
    try {
      const userInfoStr = localStorage.getItem('userInfo');
      const token = userInfoStr ? JSON.parse(userInfoStr).token : '';
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const groupId = manageModal.group?._id;
      if (!groupId) return alert("⚠️ Error: Group ID not found!");
      const response = await axios.delete(`http://localhost:5001/api/groups/${groupId}/remove-student/${studentId}`, config);
      alert(`✅ ${response.data.message}`);
      setManageModal(prev => ({ ...prev, students: prev.students.filter(student => student._id !== studentId) }));
      fetchMentorData(token);
    } catch (error) {
      alert(`⚠️ ${error.response?.data?.message || "Server error removing student"}`);
    }
  };

  const copyToClipboard = (link) => {
    navigator.clipboard.writeText(link);
    alert("🔗 Link copied to clipboard!");
  };

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/login', { replace: true });
  };

  if (!user || loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F7FE]">
      <div className="flex flex-col items-center">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-fuchsia-200 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-fuchsia-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <p className="mt-4 text-fuchsia-900 font-bold tracking-widest text-sm uppercase animate-pulse">Loading Workspace...</p>
      </div>
    </div>
  );

  const myHostedGroups = myGroups.filter(g => g.senior_id?._id === user?._id || g.senior_id === user?._id || !g.senior_id);
  const filteredSessions = myHostedGroups.filter(g => g.module_name.toLowerCase().includes(sessionSearch.toLowerCase()));

  const totalStudents = myHostedGroups.reduce((sum, group) => sum + (group.current_members?.length || 0), 0);
  const allPendingRequests = myHostedGroups.flatMap(group =>
    (group.pending_members || []).map(student => ({ student, group }))
  );
  const totalRequests = allPendingRequests.length;

  // Filter messages for THIS mentor
  const myInbox = platformMessages.filter(m => m.receiverId === user?._id).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  // Count unread (If the thread was replied by junior last, or brand new message)
  const unreadMessagesCount = myInbox.filter(m => m.readBySenior === false || (m.readBySenior === undefined && m.reply === null)).length;

  // Helper to compile thread history including legacy replies
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

  // 🔴 FILTER FEEDBACK FOR WIDGET DYNAMICALLY
  const myFeedback = myInbox.filter(m => m.type === 'Feedback').slice(0, 2);

  // 🔴 CENTRALIZED MENTOR XP & RANK CALCULATION
  const getCalculatedMentorXP = (mentor) => {
    const baseXP = mentor.points || 0;
    const hosted = myGroups.filter(g => (g.senior_id?._id || g.senior_id) === mentor._id).length;
    const students = myGroups.filter(g => (g.senior_id?._id || g.senior_id) === mentor._id).reduce((sum, g) => sum + (g.current_members?.length || 0), 0);
    return baseXP + (hosted * 500) + (students * 150) + 3000;
  };

  const globalRankedMentors = [...globalMentors].map((mentor) => {
    const isMe = mentor._id === user?._id;
    const rawXP = getCalculatedMentorXP(mentor);
    return {
      id: mentor._id,
      name: mentor.name,
      xp: rawXP,
      level: "Senior Expert",
      avatar: mentor.avatar,
      initial: mentor.name ? mentor.name.charAt(0).toUpperCase() : 'M',
      isMe: isMe
    };
  })
    .sort((a, b) => b.xp - a.xp) // Sort initially by raw calculated XP
    .map((mentor, index) => {
      // Apply deduction exactly based on their ordered rank
      return { ...mentor, xp: mentor.xp - (index * 340) };
    });

  // Get current user's specific XP and Rank from the synchronized array
  const myMentorData = globalRankedMentors.find(m => m.isMe);
  const calculatedXP = myMentorData ? myMentorData.xp : 0;
  const myGlobalRank = globalRankedMentors.findIndex(m => m.isMe) + 1;

  const currentLevel = Math.floor(calculatedXP / 1000) + 1;
  const nextMilestone = currentLevel * 1000;
  const currentLevelXP = calculatedXP % 1000;
  const xpProgress = Math.min(100, (currentLevelXP / 1000) * 100);

  // ---------------------------------------------------------
  // 🟢 TAB 1: DASHBOARD UI
  // ---------------------------------------------------------
  const renderDashboard = () => (
    <div className="space-y-10 animate-in fade-in duration-700">

      {/* 🚀 Modern Hero Carousel (Kuppi Space Style) */}
      <div className="relative rounded-[3rem] text-white shadow-2xl overflow-hidden group border border-white/10 h-[420px] md:h-[500px]">
        {/* Carousel slide transition container */}
        <div className="absolute inset-0 transition-all duration-700 ease-in-out">

          {/* Slide 0: Personalized Text Content */}
          {heroSlide === 0 && (
            <div className="sn-slide absolute inset-0 z-10 flex flex-col md:flex-row justify-between items-center p-10 md:p-14 gap-10 text-left">
              <div className="absolute inset-0 bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#4c1d95] -z-10"></div>
              <div className="absolute top-0 right-0 -mt-20 w-96 h-96 bg-indigo-500 rounded-full mix-blend-screen filter blur-[100px] opacity-40"></div>
              <div className="absolute bottom-0 left-20 -mb-20 w-80 h-80 bg-blue-600 rounded-full mix-blend-screen filter blur-[100px] opacity-40"></div>

              <div className="w-full md:w-2/3 relative z-20">
                <div className="flex items-center space-x-2 mb-4 bg-white/10 w-fit px-4 py-2 rounded-full backdrop-blur-md border border-white/10 shadow-sm">
                  <Sparkles className="w-4 h-4 text-blue-300 animate-pulse" />
                  <p className="text-blue-100 font-bold tracking-[0.2em] uppercase text-[10px]">{greeting}, {user?.name?.split(' ')[0]}!</p>
                </div>
                <h2 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter leading-[1.05]">
                  Inspire the <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-blue-300 to-indigo-300">
                    Next Generation.
                  </span>
                </h2>
                <p className="text-indigo-100/80 text-lg mb-10 max-w-xl leading-relaxed font-medium">
                  You are currently hosting <span className="text-white font-black bg-white/10 px-3 py-1 rounded-lg border border-white/20 backdrop-blur-sm">{myHostedGroups.length} active masterclasses</span>. Guide your juniors and help them master their tech skills!
                </p>
                <div className="flex space-x-4">
                  <button onClick={() => setIsModalOpen(true)} className="flex items-center px-8 py-4 bg-white text-indigo-950 rounded-2xl font-black text-lg hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,255,255,0.2)] group/btn">
                    <Plus className="w-6 h-6 mr-3 group-hover/btn:rotate-90 transition-transform" /> Publish Recording
                  </button>
                </div>
              </div>

              {/* Rank Widget */}
              <div
                onClick={() => setActiveTab('leaderboard')}
                className="w-full md:w-auto bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-2xl p-10 rounded-[3rem] border border-white/20 shadow-2xl transform hover:-translate-y-2 hover:scale-[1.02] cursor-pointer transition-all duration-500 relative overflow-hidden group/card z-20 hidden lg:block"
                title="Click to view full Mentor Leaderboard"
              >
                <div className="flex items-center justify-between mb-6 gap-8">
                  <p className="text-sm text-fuchsia-100 font-black uppercase tracking-widest">Global Rank</p>
                  <div className="p-3 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl shadow-lg"><Award className="w-6 h-6 text-white" /></div>
                </div>
                <p className="text-6xl font-black text-white flex items-center tracking-tighter">
                  #{myGlobalRank > 0 ? myGlobalRank : '--'}
                </p>
                <p className="text-fuchsia-200 font-bold mb-6 mt-2">{calculatedXP} Total XP</p>
                <div className="w-full bg-black/20 rounded-full h-2 overflow-hidden shadow-inner">
                  <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-fuchsia-500 relative" style={{ width: `${xpProgress}%` }}></div>
                </div>
              </div>
            </div>
          )}

          {/* Slide 1 & 2: Image Content */}
          {heroSlide > 0 && (() => {
            const slide = HERO_SLIDES[heroSlide];
            return (
              <div className="sn-slide absolute inset-0 z-10" key={heroSlide}>
                <div className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105" style={{ backgroundImage: `url(${slide.src})`, filter: 'brightness(0.4)' }}></div>
                <div className="absolute inset-0 bg-gradient-to-r from-[#1e1b4b] via-transparent to-transparent opacity-60"></div>

                <div className="absolute inset-0 flex items-center p-10 md:p-14">
                  <div className="max-w-xl">
                    <div className="inline-flex items-center space-x-2 mb-6 bg-white/10 px-5 py-2.5 rounded-full border border-white/20 backdrop-blur-md shadow-sm">
                      <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                      <p className="text-white font-bold tracking-[0.2em] uppercase text-[10px]">{slide.badge}</p>
                    </div>
                    <h2 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter leading-[1.05] text-white">
                      {slide.title}
                    </h2>
                    <p className="text-indigo-50/80 text-xl font-medium leading-relaxed mb-10">
                      {slide.subtitle}
                    </p>
                    <button onClick={() => setActiveTab('sessions')} className="px-10 py-5 bg-white text-indigo-950 rounded-2xl font-black text-lg hover:scale-105 transition-all shadow-2xl">
                      Manage My Space
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Carousel Navigation: Dots */}
        <div className="absolute bottom-10 left-10 flex space-x-3 z-30">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setHeroSlide(i)}
              className={`sn-dot ${heroSlide === i ? 'active bg-white' : 'bg-white/30 hover:bg-white/50'}`}
            />
          ))}
        </div>

        {/* Carousel Navigation: Arrows */}
        <div className="absolute bottom-10 right-10 flex space-x-4 z-30">
          <button
            onClick={() => setHeroSlide(s => (s - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
            className="p-4 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-2xl transition-all hover:scale-110 active:scale-95"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <button
            onClick={() => setHeroSlide(s => (s + 1) % HERO_SLIDES.length)}
            className="p-4 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-2xl transition-all hover:scale-110 active:scale-95"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex items-center justify-between hover:shadow-xl hover:border-indigo-100 transition-all group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3"><TrendingUp className="w-4 h-4 text-emerald-500 opacity-20" /></div>
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Total Views</p>
              <span className="text-[9px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded-md font-bold">+12%</span>
            </div>
            <h4 className="text-4xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">1.2K</h4>
          </div>
          <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 border border-indigo-100/50 shadow-inner group-hover:scale-110 transition-transform"><Activity className="w-7 h-7" /></div>
        </div>
        <div className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex items-center justify-between hover:shadow-xl hover:border-amber-100 transition-all group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3"><Star className="w-4 h-4 text-amber-500 opacity-20" /></div>
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Avg Rating</p>
              <span className="text-[9px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded-md font-bold">Stable</span>
            </div>
            <h4 className="text-4xl font-black text-slate-900 group-hover:text-amber-500 transition-colors">4.9</h4>
          </div>
          <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 border border-amber-100/50 shadow-inner group-hover:scale-110 transition-transform"><Star className="w-7 h-7 fill-amber-400" /></div>
        </div>
        <div className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex items-center justify-between hover:shadow-xl hover:border-fuchsia-100 transition-all group">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Total Classes</p>
            <h4 className="text-4xl font-black text-slate-900 group-hover:text-fuchsia-600 transition-colors">{myHostedGroups.length}</h4>
          </div>
          <div className="w-14 h-14 bg-fuchsia-50 rounded-2xl flex items-center justify-center text-fuchsia-600 border border-fuchsia-100/50 shadow-inner group-hover:scale-110 transition-transform"><LayoutTemplate className="w-7 h-7" /></div>
        </div>
        <div className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex items-center justify-between hover:shadow-xl hover:border-emerald-100 transition-all group">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Total Students</p>
            <h4 className="text-4xl font-black text-slate-900 group-hover:text-emerald-500 transition-colors">{totalStudents}</h4>
          </div>
          <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 border border-emerald-100/50 shadow-inner group-hover:scale-110 transition-transform"><Users className="w-7 h-7" /></div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        <div className="xl:col-span-2 space-y-8">

          <div className="bg-gradient-to-br from-slate-900 via-[#1e1b4b] to-[#0f172a] rounded-[2.5rem] shadow-2xl p-10 text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between group border border-white/5">
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600 rounded-full mix-blend-overlay filter blur-[80px] opacity-20 -mr-20 -mt-20"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600 rounded-full mix-blend-overlay filter blur-[70px] opacity-10 -ml-20 -mb-20"></div>

            <button onClick={() => {
              setTimerForm({ module_name: liveSession?.module_name || '', targetDate: liveSession?.targetDate || '' });
              setTimerModalOpen(true);
            }}
              className="absolute top-6 right-6 p-2.5 bg-white/5 hover:bg-fuchsia-500 rounded-xl transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm border border-white/10"
              title="Set Live Session Countdown">
              <Edit3 className="w-5 h-5 text-white" />
            </button>

            <div className="relative z-10 mb-8 md:mb-0 w-full md:w-auto text-left">
              <div className="flex items-center space-x-3 mb-3">
                <div className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                </div>
                <h3 className="text-[10px] font-black text-rose-400 uppercase tracking-[0.3em]">Upcoming Live Class</h3>
              </div>
              <h3 className="text-4xl font-black mb-2 tracking-tight">{liveSession && liveSession.module_name ? liveSession.module_name : 'No Session Scheduled'}</h3>
              <p className="text-indigo-200/80 font-semibold text-base">{liveSession && liveSession.targetDate ? 'Ready to share your expertise? Prepare materials.' : 'Click the edit icon to schedule a new live session.'}</p>
            </div>

            {liveSession && liveSession.targetDate ? (
              <div className="relative z-10 flex space-x-4">
                {[
                  { val: timeLeft.days, label: 'Days' },
                  { val: timeLeft.hours, label: 'Hrs' },
                  { val: timeLeft.mins, label: 'Min', glow: true },
                  { val: timeLeft.secs, label: 'Sec', accent: true }
                ].map((item, idx) => (
                  <div key={idx} className={`relative p-5 rounded-3xl text-center min-w-[85px] border backdrop-blur-xl shadow-2xl transition-transform hover:scale-105 ${item.accent ? 'bg-fuchsia-600/10 border-fuchsia-500/30' : 'bg-white/5 border-white/10'}`}>
                    <p className={`text-3xl font-black ${item.accent ? 'text-fuchsia-300' : 'text-white'} ${item.glow ? 'animate-pulse' : ''}`}>{item.val}</p>
                    <p className={`text-[9px] font-black uppercase tracking-widest mt-2 ${item.accent ? 'text-fuchsia-400/80' : 'text-slate-400'}`}>{item.label}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="relative z-10 flex space-x-4 opacity-30 grayscale ring-1 ring-white/10 p-2 rounded-[2rem]">
                {['00', '00', '00'].map((val, idx) => (
                  <div key={idx} className="bg-white/5 border border-white/10 p-5 rounded-2xl text-center min-w-[85px]">
                    <p className="text-3xl font-black text-white">{val}</p>
                    <p className="text-[10px] font-bold text-gray-500 mt-1 uppercase tracking-widest">--</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black text-gray-900 flex items-center"><Target className="w-7 h-7 mr-3 text-fuchsia-600" /> Recent Sessions</h3>
              <button onClick={() => setActiveTab('sessions')} className="text-sm font-black text-fuchsia-600 hover:text-white hover:bg-fuchsia-600 bg-fuchsia-50 px-4 py-2 rounded-xl transition-colors flex items-center">
                View All <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myHostedGroups.filter(g => g.module_name.toLowerCase().includes(globalSearch.toLowerCase())).slice(0, 2).map((group, index) => {
                const fillPercentage = (group.current_members.length / group.max_members) * 100;
                const isAlt = index % 2 !== 0;
                return (
                  <div key={group._id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 hover:border-blue-200 hover:shadow-xl transition-all duration-500 group relative overflow-hidden text-left flex flex-col justify-between h-full">
                    <div className={`absolute top-0 right-0 w-40 h-40 rounded-bl-full -z-10 transition-transform duration-700 ${isAlt ? 'bg-blue-50/50 group-hover:scale-[1.5]' : 'bg-fuchsia-50/50 group-hover:scale-[1.5]'}`}></div>

                    <div className="mb-6 relative">
                      <div className="flex justify-between items-start mb-4">
                        <span className={`inline-block px-4 py-1.5 rounded-xl text-[10px] font-black tracking-widest border uppercase ${isAlt ? 'bg-blue-100/60 text-blue-700 border-blue-200' : 'bg-fuchsia-100/60 text-fuchsia-700 border-fuchsia-200'}`}>
                          {group.semester || 'Masterclass'}
                        </span>
                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-rose-500 border border-slate-100 shadow-sm"><YoutubeIcon className="w-5 h-5" /></div>
                      </div>
                      <h4 className="font-black text-slate-800 text-2xl mb-2 leading-tight pr-4">{group.module_name}</h4>
                      <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest flex items-center"><ShieldCheck className="w-3 h-3 mr-2 text-emerald-500" /> Active Session</p>
                    </div>

                    <div className="mt-auto">
                      <div className="flex justify-between items-end mb-3">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Enrollment Bloom</p>
                        <p className="text-xs font-black text-indigo-600">{group.current_members.length} <span className="text-slate-300">/</span> {group.max_members}</p>
                      </div>
                      <div className="w-full bg-slate-50 rounded-full h-3 overflow-hidden mb-6 border border-slate-100 p-0.5">
                        <div className={`h-full rounded-full transition-all duration-1000 ${fillPercentage >= 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-blue-500 via-indigo-500 to-fuchsia-500'}`} style={{ width: `${fillPercentage}%` }}></div>
                      </div>
                      <div className="flex space-x-3">
                        <button onClick={() => copyToClipboard(group.session_link)} className="p-4 bg-slate-50 text-slate-400 hover:bg-blue-600 hover:text-white rounded-2xl transition-all border border-slate-100 hover:border-blue-600 shadow-sm" title="Copy Invite Link">
                          <Share2 className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleManageStudents(group)} className="flex-1 py-4 bg-[#1e3a8a] hover:bg-indigo-600 text-white font-black rounded-2xl transition-all shadow-lg flex justify-center items-center group/btn space-x-2">
                          <span>Manage Students</span>
                          <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
              {myHostedGroups.length === 0 && (
                <div className="text-center py-16 bg-white rounded-[2rem] border-2 border-dashed border-gray-200 col-span-2">
                  <LayoutTemplate className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-400 font-bold text-lg">You haven't created any sessions yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* 🔴 RECENT FEEDBACK WIDGET (DYNAMIC) */}
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8 text-left">
            <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center justify-between">
              Recent Feedback <MessageSquare className="w-6 h-6 text-indigo-500" />
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {myFeedback.length > 0 ? myFeedback.map((fb) => (
                <div key={fb.id} className="p-5 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:-translate-y-1 transition-transform cursor-default flex flex-col">
                  <div className="flex items-center space-x-1 mb-3">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" /><Star className="w-4 h-4 text-amber-400 fill-amber-400" /><Star className="w-4 h-4 text-amber-400 fill-amber-400" /><Star className="w-4 h-4 text-amber-400 fill-amber-400" /><Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  </div>
                  <p className="text-sm text-gray-700 font-bold italic mb-4 leading-relaxed line-clamp-3">"{fb.text}"</p>
                  <div className="flex items-center mt-auto">
                    <div className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-[10px] font-black mr-2 overflow-hidden shrink-0">
                      {fb.senderAvatar ? <img src={fb.senderAvatar} alt="avatar" className="w-full h-full object-cover" /> : fb.senderName.charAt(0).toUpperCase()}
                    </div>
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest truncate">{fb.senderName}</p>
                    <span className="ml-auto text-[9px] text-gray-400 font-bold shrink-0">{new Date(fb.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>
              )) : (
                <div className="col-span-2 text-center py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm font-bold text-gray-400">No feedback received yet.</p>
                </div>
              )}
            </div>
          </div>

        </div>

        <div className="space-y-8">

          {/* Expert Performance Analytics (DYNAMIC) */}
          <div
            onClick={() => setActiveTab('leaderboard')}
            className="glass-dark rounded-[2.5rem] shadow-2xl p-8 text-white relative overflow-hidden border border-white/10 group cursor-pointer hover:shadow-indigo-500/20 transition-all duration-500"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-150 transition-transform duration-1000"><BarChart3 className="w-20 h-20 text-indigo-400" /></div>

            <div className="flex items-center space-x-3 mb-8">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20 backdrop-blur-md shadow-inner">
                <TrendingUp className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-black tracking-tight group-hover:text-blue-300 transition-colors">Expert Analytics</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center">Live Metrics <span className="ml-2 w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span></p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2 items-end">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Student Sentiment</span>
                  <span className="text-xs font-black text-emerald-400">{myFeedback.length > 0 ? '98%' : '94%'} Positive</span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-3 p-1 overflow-hidden border border-white/10 shadow-inner">
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-1000" style={{ width: myFeedback.length > 0 ? '98%' : '94%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2 items-end">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Engagement Velocity</span>
                  <span className="text-xs font-black text-indigo-400">{totalStudents > 0 ? 'High' : 'Stable'}</span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-3 p-1 overflow-hidden border border-white/10 shadow-inner">
                  <div className="bg-gradient-to-r from-indigo-500 to-fuchsia-500 h-full rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)] transition-all duration-1000 animate-pulse" style={{ width: `${Math.min(100, 75 + (totalStudents * 2))}%` }}></div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-white/5">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Strategic Growth Tips</p>
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="space-y-3">
                  {[
                    totalStudents < 10 ? "Aim for 10+ students to unlock 'Silver' badge." : "Great student reach! Keep uploading new content.",
                    unreadMessagesCount > 0 ? `Respond to ${unreadMessagesCount} unread messages.` : "Excellent responsiveness this week.",
                    "Live workshops increase engagement by 40%."
                  ].map((tip, i) => (
                    <div key={i} className="flex items-start bg-white/5 p-3 rounded-xl border border-white/5 group/tip hover:bg-white/10 transition-colors">
                      <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-1.5 mr-3 group-hover/tip:scale-150 transition-transform"></div>
                      <p className="text-[11px] font-medium text-slate-300 leading-relaxed line-clamp-2">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Pending Requests Widget */}
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8 text-left relative overflow-hidden">
            <div className="absolute top-0 right-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 to-blue-500"></div>
            <h3 className="text-xl font-black text-gray-900 mb-2 flex items-center justify-between">
              Requests
              {totalRequests > 0 && <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-xl text-sm animate-pulse">{totalRequests} New</span>}
            </h3>
            <p className="text-sm text-gray-500 font-semibold mb-6">Juniors requesting to join.</p>

            <div className="space-y-4 max-h-[250px] overflow-y-auto no-scrollbar pr-2">
              {totalRequests > 0 ? (
                allPendingRequests.map(({ student, group }) => (
                  <div key={`${group._id}-${student._id}`} className="flex items-center p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:border-indigo-200 transition-colors group/req">
                    <div className="w-10 h-10 rounded-xl mr-3 bg-indigo-100 text-indigo-600 flex items-center justify-center font-black border border-indigo-200 shadow-sm shrink-0 overflow-hidden">
                      {student.avatar ? <img src={student.avatar} alt="avatar" className="w-full h-full object-cover" /> : (student.name ? student.name.charAt(0).toUpperCase() : 'S')}
                    </div>
                    <div className="flex-1 overflow-hidden pr-2">
                      <h4 className="font-black text-gray-900 text-sm group-hover/req:text-indigo-600 transition-colors truncate">{student.name}</h4>
                      <p className="text-[10px] text-gray-500 font-bold mt-0.5 truncate">
                        Req: <span className="text-indigo-600">{group.module_name}</span>
                      </p>
                    </div>
                    <div className="flex space-x-1 shrink-0">
                      <button onClick={() => handleApproveRequest(group._id, student._id)} className="p-1.5 rounded-lg bg-emerald-100 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-colors" title="Approve">
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleRejectRequest(group._id, student._id)} className="p-1.5 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-50 hover:text-blue-600 hover:text-white transition-colors" title="Reject">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                  <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-400 font-bold text-sm">No new requests.</p>
                </div>
              )}
            </div>
          </div>

          {/* MENTOR TASKS (CRUD Widget) */}
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8 text-left relative overflow-hidden">
            <h3 className="text-xl font-black text-gray-900 mb-2 flex items-center justify-between">
              Mentor Tasks <CheckSquare className="w-6 h-6 text-indigo-500" />
            </h3>
            <p className="text-sm text-gray-500 font-medium mb-6">Manage your class preparations.</p>

            <form onSubmit={handleAddTask} className="relative mb-6">
              <input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="Add a new task..."
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 pl-4 pr-12 text-sm font-bold focus:outline-none focus:border-indigo-400 transition-colors"
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </form>

            <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
              {mentorTasks.length > 0 ? mentorTasks.map(task => (
                <div key={task.id} className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${task.completed ? 'bg-gray-50 border-gray-100' : 'bg-white border-gray-200 hover:border-indigo-200'}`}>
                  <div className="flex items-center flex-1 cursor-pointer" onClick={() => toggleTask(task.id)}>
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center mr-3 border-2 transition-colors ${task.completed ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300'}`}>
                      {task.completed && <CheckCircle className="w-3 h-3 text-white" />}
                    </div>
                    <p className={`text-sm font-bold flex-1 ${task.completed ? 'text-gray-400 line-through' : 'text-gray-800'}`}>{task.text}</p>
                  </div>
                  <button onClick={() => deleteTask(task.id)} className="p-2 text-gray-300 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )) : (
                <p className="text-center text-gray-400 text-sm font-bold py-4">No tasks added yet.</p>
              )}
            </div>
          </div>

          {/* EXPERT PERFORMANCE TIPS WIDGET */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-[2.5rem] border border-blue-100 p-8 text-left relative overflow-hidden group cursor-default">
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-400 rounded-full filter blur-[50px] opacity-20 group-hover:opacity-40 transition-opacity"></div>
            <div className="relative z-10">
              <div className="flex items-center space-x-2 mb-4">
                <Lightbulb className="w-5 h-5 text-amber-500 animate-pulse" />
                <h3 className="text-xs font-black text-indigo-800 uppercase tracking-widest">Expert Performance Tips</h3>
              </div>
              <p className="text-gray-800 text-sm font-bold leading-relaxed mb-4">"Adding a Quiz to your sessions increases student engagement by <span className="text-indigo-600 font-black">40%</span>. Try adding one to your recent class!"</p>
              <button onClick={() => setActiveTab('sessions')} className="text-xs font-black text-indigo-600 hover:text-indigo-800 uppercase tracking-widest flex items-center">
                Update Sessions <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );

  // ---------------------------------------------------------
  // 🟢 TAB 6: NEW INBOX / MESSAGES UI FOR SENIOR
  // ---------------------------------------------------------
  const renderInbox = () => (
    <div className="animate-in slide-in-from-right-8 duration-500 text-left space-y-10 max-w-5xl mx-auto pb-12">

      {/* 📡 INBOX HEADER */}
      <div className="bg-gradient-to-br from-[#0f172a] to-blue-900 rounded-[3.5rem] p-12 text-white shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[80px] -mr-20 -mt-20 group-hover:bg-indigo-500/20 transition-all duration-700"></div>
        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          <div className="w-28 h-28 bg-white/10 rounded-[2.2rem] flex items-center justify-center border border-white/20 backdrop-blur-xl shadow-inner">
            <Inbox className="w-14 h-14 text-indigo-300 animate-pulse" />
          </div>
          <div>
            <div className="inline-flex items-center px-4 py-1.5 bg-indigo-500/20 text-indigo-200 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4 border border-white/10">
              <Activity className="w-3 h-3 mr-2" /> Live Communication Intel
            </div>
            <h3 className="text-5xl font-black mb-3 tracking-tighter">Command <span className="text-indigo-400">Inbox</span></h3>
            <p className="text-indigo-200/70 font-medium text-lg leading-relaxed max-w-xl">
              Deploy expert guidance, resolve student queries, and manage your mentorship network sessions in real-time.
            </p>
          </div>
        </div>
      </div>

      {/* ✉️ MESSAGES AREA */}
      <div className="bg-white rounded-[4rem] shadow-2xl shadow-indigo-100/50 border border-gray-100 p-6 sm:p-10 min-h-[600px] relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-bl-[10rem] -z-10"></div>

        {myInbox.length > 0 ? (
          <div className="space-y-12">
            {myInbox.map(msg => {
              const thread = getThread(msg);
              const unread = !msg.readBySenior && msg.reply === null;
              return (
                <div key={msg.id} className={`group/msg relative p-8 rounded-[3rem] border-2 transition-all duration-500 ${unread ? 'border-indigo-400 bg-indigo-50/20 shadow-xl' : 'border-gray-50 bg-white/50 hover:bg-white hover:border-indigo-100 hover:shadow-xl'}`}>

                  {/* Thread Context Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 pb-6 border-b border-gray-100/80 gap-4">
                    <div className="flex items-center space-x-5">
                      <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center p-0.5 overflow-hidden shadow-sm">
                        {msg.senderAvatar ? <img src={msg.senderAvatar} alt="S" className="w-full h-full object-cover rounded-xl" /> : <div className="w-full h-full bg-indigo-600 flex items-center justify-center text-white font-black text-xl">{msg.senderName.charAt(0)}</div>}
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1 flex items-center">
                          <Compass className="w-3 h-3 mr-2" /> Student Briefing • {msg.type}
                        </p>
                        <h4 className="text-xl font-black text-slate-900 tracking-tight leading-none">{msg.senderName}</h4>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 w-full sm:w-auto self-end sm:self-center">
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest mr-2">{new Date(msg.timestamp).toLocaleDateString()}</span>
                      {unread && (
                        <button onClick={() => handleToggleNotifications(msg.id)} className="px-4 py-2 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-500/30 hover:bg-indigo-500 transition-all text-[9.5px] font-black uppercase tracking-widest active:scale-95">
                          Analyze & Mark Read
                        </button>
                      )}
                      <button onClick={() => handleDeleteMessage(msg.id)} className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all" title="Archive Thread">
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  </div>

                  {/* Chat Content Intelligence Feed */}
                  <div className="space-y-8 max-h-[500px] overflow-y-auto px-2 custom-scrollbar-indigo flex flex-col">

                    {/* Incoming: Junior Brief (Left) */}
                    <div className="flex flex-col items-start animate-in fade-in slide-in-from-left-4 duration-500">
                      <div className="bg-slate-100 hover:bg-slate-200 transition-colors text-slate-900 px-6 py-5 rounded-[2.5rem] rounded-tl-lg max-w-[90%] sm:max-w-[75%] shadow-sm border border-slate-200 relative">
                        <p className="text-sm font-bold leading-relaxed">{msg.text}</p>
                        <div className="mt-3 flex items-center opacity-40 text-[9px] font-black uppercase tracking-widest">
                          <Clock className="w-2.5 h-2.5 mr-1" /> {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>

                    {/* Thread Dialogue */}
                    {thread.map((reply, i) => {
                      const isMe = reply.senderId === user._id;
                      if (isMe) {
                        return (
                          <div key={reply.id || i} className="flex flex-col items-end group/reply w-full animate-in fade-in slide-in-from-right-4 duration-500">
                            {editingReplyId === (reply.id || msg.id) ? (
                              /* 🎛️ IN-LINE NEURAL EDITOR */
                              <div className="bg-white border-2 border-indigo-400 p-8 rounded-[3rem] shadow-[0_20px_60px_rgba(79,70,229,0.15)] w-full max-w-[95%] animate-in slide-in-from-bottom-4 relative">
                                <div className="flex items-center mb-5">
                                  <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center mr-3">
                                    <Edit3 className="w-4 h-4 text-indigo-600" />
                                  </div>
                                  <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">Refining Expert Intelligence</span>
                                </div>
                                <textarea
                                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl p-6 text-sm font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-400 mb-6 resize-none transition-all placeholder-slate-400 shadow-inner min-h-[120px]"
                                  value={editReplyText}
                                  onChange={(e) => setEditReplyText(e.target.value)}
                                  autoFocus
                                />
                                <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
                                  <div className="flex items-center bg-slate-50 px-5 py-2.5 rounded-xl border border-slate-200">
                                    <Sparkles className={`w-4 h-4 mr-2 ${editReplyText.length > 400 ? 'text-amber-500' : 'text-indigo-400'}`} />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{editReplyText.length} / 500</span>
                                  </div>
                                  <div className="flex space-x-3 w-full sm:w-auto">
                                    <button onClick={() => { setEditingReplyId(null); setEditReplyText(''); }} className="flex-1 px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all">Cancel</button>
                                    <button onClick={() => {
                                      if (reply.id === 'legacy') handleUpdateReply(msg.id);
                                      else handleEditThreadReply(msg.id, reply.id, editReplyText);
                                    }} disabled={!editReplyText.trim() || editReplyText.length > 500} className="flex-1 px-10 py-4 text-[10px] font-black text-white uppercase tracking-widest bg-indigo-600 hover:bg-indigo-500 rounded-2xl shadow-xl shadow-indigo-500/30 transition-all flex items-center justify-center">Deploy Update</button>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              /* 🏆 EXPERT RESPONSE BUBBLE (ME) */
                              <div className="flex flex-col items-end group/bubble max-w-[90%] sm:max-w-[75%]">
                                <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 text-white px-7 py-6 rounded-[2.5rem] rounded-tr-lg shadow-xl shadow-indigo-500/20 text-left relative group/editbtn">
                                  <p className="text-sm font-semibold leading-relaxed tracking-wide">{reply.text}</p>
                                  <div className="mt-4 flex items-center justify-between">
                                    <div className="flex items-center opacity-40 text-[9px] font-black uppercase tracking-widest">
                                      <ShieldCheck className="w-2.5 h-2.5 mr-1" /> Expert Verified • {reply.timestamp ? new Date(reply.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                                    </div>
                                    <div className="flex items-center space-x-2 pl-6">
                                      <button onClick={() => { setEditingReplyId(reply.id || msg.id); setEditReplyText(reply.text); }} className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-all" title="Edit Intel"><Edit3 className="w-3 h-3" /></button>
                                      <button onClick={() => {
                                        if (reply.id === 'legacy') handleDeleteReply(msg.id);
                                        else handleDeleteThreadReply(msg.id, reply.id);
                                      }} className="p-1.5 bg-white/10 hover:bg-red-500/50 rounded-lg transition-all" title="Nuke Response"><Trash2 className="w-3 h-3" /></button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      } else {
                        /* 🟢 JUNIOR FOLLOW-UP (Left) */
                        return (
                          <div key={reply.id || i} className="flex flex-col items-start animate-in fade-in slide-in-from-left-4 duration-500">
                            <div className="bg-slate-100 text-slate-900 px-6 py-5 rounded-[2.5rem] rounded-tl-lg max-w-[90%] sm:max-w-[75%] shadow-sm border border-slate-200">
                              <p className="text-sm font-medium leading-relaxed">{reply.text}</p>
                              <div className="mt-3 flex items-center opacity-40 text-[9px] font-black uppercase tracking-widest text-slate-500">
                                <Clock className="w-2.5 h-2.5 mr-1" /> {new Date(reply.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          </div>
                        );
                      }
                    })}

                    {/* 🧠 CONTINUOUS NEURAL REPLY INTERFACE (AT THE END) */}
                    <div className="flex flex-col items-end w-full mt-10 pt-10 border-t-2 border-dashed border-slate-100">
                      {replyingTo === msg.id ? (
                        <div className="bg-white border-4 border-indigo-100 p-8 rounded-[3.5rem] rounded-tr-2xl shadow-[0_40px_100px_-20px_rgba(79,70,229,0.25)] w-full max-w-[95%] animate-in slide-in-from-bottom-6 relative">
                          <div className="absolute top-0 right-10 -translate-y-1/2 bg-indigo-600 p-4 rounded-2xl shadow-xl shadow-indigo-500/50">
                            <Zap className="w-6 h-6 text-white" />
                          </div>

                          <div className="flex items-center mb-6">
                            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center mr-4">
                              <CornerDownRight className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div>
                              <h5 className="font-black text-slate-900 leading-none mb-1">Neural Advice Stream</h5>
                              <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Drafting Response to {msg.senderName}</p>
                            </div>
                          </div>

                          <textarea
                            className="w-full bg-slate-50 border-2 border-slate-200 rounded-[2rem] p-7 text-sm font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-400 mb-6 resize-none transition-all placeholder-slate-400 min-h-[150px] shadow-inner"
                            placeholder="Synthesize your expert advice here..."
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            autoFocus
                          />

                          <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
                            <div className="flex items-center bg-indigo-50 px-5 py-3 rounded-2xl border border-indigo-100">
                              <Activity className={`w-4 h-4 mr-2 ${replyText.length > 400 ? 'text-amber-500 animate-bounce' : 'text-indigo-400'}`} />
                              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">{replyText.length} / 500 Tokens</span>
                            </div>

                            <div className="flex space-x-3 w-full sm:w-auto">
                              <button onClick={() => { setReplyingTo(null); setReplyText(''); }} className="flex-1 sm:flex-none px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-all">Abort Draft</button>
                              <button onClick={() => handleThreadReply(msg.id)} disabled={!replyText.trim() || replyText.length > 500} className="flex-1 sm:flex-none px-12 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-2xl shadow-indigo-500/40 hover:-translate-y-1 transition-all group-disabled:opacity-50 flex items-center justify-center overflow-hidden relative">
                                <span className="relative z-10 flex items-center">Broadcast Intel <Send className="w-4 h-4 ml-3" /></span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <button onClick={() => { setReplyingTo(msg.id); setReplyText(''); }} className="group relative pr-10 pl-6 py-5 bg-[#0f172a] hover:bg-indigo-600 text-white rounded-[1.8rem] transition-all duration-500 flex items-center shadow-xl shadow-indigo-900/20 hover:-translate-y-1">
                          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center mr-4 group-hover:bg-white group-hover:text-indigo-600 transition-colors">
                            <MessageSquare className="w-5 h-5" />
                          </div>
                          <span className="font-black text-xs uppercase tracking-widest">Interface Response</span>
                          <div className="absolute right-6 group-hover:translate-x-2 transition-transform">
                            <ChevronRight className="w-5 h-5 text-indigo-400" />
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
          /* 📭 EMPTY STATE */
          <div className="py-24 flex flex-col items-center justify-center animate-in fade-in duration-1000">
            <div className="w-32 h-32 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200 flex items-center justify-center mb-8">
              <Mail className="w-14 h-14 text-slate-300" />
            </div>
            <h4 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-3">Void Detected</h4>
            <p className="text-slate-400 font-bold text-lg max-w-sm text-center">Your command inbox is currently clear of pending junior inquiries. Operational efficiency is at 100%.</p>
          </div>
        )}
      </div>
    </div>
  );

  // ---------------------------------------------------------
  // 🟢 TAB 2: MY SESSIONS UI 
  // ---------------------------------------------------------
  // ---------------------------------------------------------
  // 🟢 TAB 2: SESSION INTELLIGENCE DOSSIERS
  // ---------------------------------------------------------
  const renderSessions = () => (
    <div className="animate-in slide-in-from-bottom-8 duration-700 text-left space-y-12 max-w-6xl mx-auto pb-12 px-4 sm:px-0">

      {/* 🚀 OPERATIONAL HEADER */}
      <div className="flex flex-col lg:flex-row justify-between lg:items-end gap-10">
        <div className="space-y-2">
          <div className="inline-flex items-center px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4 border border-indigo-100 shadow-sm">
            <Activity className="w-3.5 h-3.5 mr-2" /> Live Session Telemetry
          </div>
          <h3 className="text-5xl font-black text-slate-900 tracking-tighter leading-none">Masterclass <span className="text-indigo-600">Dossiers</span></h3>
          <p className="text-slate-400 font-bold text-lg max-w-xl">
            Command and manage your global academic network, student intake, and intelligence assets.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
          <div className="relative w-full sm:w-80 group">
            <div className="absolute inset-0 bg-indigo-100 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5 relative z-10" />
            <input
              type="text"
              placeholder="Filter dossiers..."
              value={sessionSearch}
              onChange={(e) => setSessionSearch(e.target.value)}
              className="w-full pl-14 pr-6 py-4 bg-white border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-600 font-bold text-sm shadow-sm relative z-10 transition-all placeholder-slate-300"
            />
          </div>
          <button onClick={() => setIsModalOpen(true)} className="flex items-center px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black transition-all shadow-2xl shadow-indigo-500/30 w-full sm:w-auto justify-center hover:-translate-y-1 leading-none text-xs uppercase tracking-widest shrink-0">
            <Plus className="w-5 h-5 mr-3" /> Initialize New Dossier
          </button>
        </div>
      </div>

      {/* 📂 DOSSIER GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {filteredSessions.map((group, index) => {
          const fillPercentage = (group.current_members.length / group.max_members) * 100;
          const status = fillPercentage >= 100 ? 'MAX CAPACITY' : 'OPERATIONAL';
          const isFull = fillPercentage >= 100;

          return (
            <div key={group._id} className="bg-white/70 backdrop-blur-md p-10 rounded-[3.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 hover:border-indigo-300 transition-all duration-500 relative text-left flex flex-col group/card hover:-translate-y-2 overflow-hidden">

              {/* Decorative Background Glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -z-10 group-hover/card:bg-indigo-100/50 transition-colors"></div>

              {/* Status & Actions Header */}
              <div className="flex justify-between items-start mb-8">
                <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border flex items-center ${isFull ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full mr-2 ${isFull ? 'bg-emerald-500' : 'bg-indigo-500 animate-pulse'}`}></div>
                  {status}
                </div>
                <div className="flex space-x-2">
                  <button onClick={() => openEditModal(group)} className="p-3 bg-white text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all shadow-sm border border-slate-100" title="Modify dossier"><Edit3 className="w-4 h-4" /></button>
                  <button onClick={() => handleDeleteSession(group._id, group.module_name)} className="p-3 bg-white text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all shadow-sm border border-slate-100" title="Nuke dossier"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>

              {/* Module Metadata */}
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-[#1e3a8a] rounded-2xl mr-5 flex items-center justify-center shadow-xl group-hover/card:scale-110 transition-transform duration-500">
                  <span className="text-white font-black text-xl">{group.module_name.charAt(0)}</span>
                </div>
                <div>
                  <h4 className="font-black text-2xl text-slate-900 tracking-tighter leading-none mb-2">{group.module_name}</h4>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center">
                    <Timer className="w-3.5 h-3.5 mr-1.5 text-indigo-400" /> {group.semester || 'Academic Season'} • Distributed Network
                  </p>
                </div>
              </div>

              {/* Student Stacking Visualization */}
              <div className="flex items-center mb-10">
                <div className="flex -space-x-3 mr-4">
                  {[1, 2, 3].map((_, i) => (
                    <div key={i} className="w-10 h-10 rounded-xl border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400">
                      {i === 2 ? '+' : 'S'}
                    </div>
                  ))}
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest"><span className="text-slate-900 font-black">{group.current_members.length}</span> Intake Recruits</p>
              </div>

              {/* Capacity Matrix */}
              <div className="mb-10 mt-auto">
                <div className="flex justify-between items-end mb-3">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Network Occupancy Matrix</span>
                  <span className="text-sm font-black text-indigo-600">{Math.round(fillPercentage)}% Capacity</span>
                </div>
                <div className="w-full bg-slate-100 rounded-2xl h-3 overflow-hidden shadow-inner">
                  <div className={`h-full rounded-2xl transition-all duration-1000 ${isFull ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-gradient-to-r from-indigo-500 to-blue-500 shadow-[0_0_15px_rgba(79,70,229,0.4)]'}`} style={{ width: `${fillPercentage}%` }}></div>
                </div>
              </div>

              {/* Action Interface */}
              <div className="flex space-x-4">
                <button onClick={() => copyToClipboard(group.session_link)} className="p-5 bg-[#1e3a8a] text-white rounded-[1.5rem] hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 active:scale-95 group/share" title="Access Link">
                  <Share2 className="w-5 h-5 group-hover/share:rotate-12 transition-transform" />
                </button>
                <button onClick={() => handleManageStudents(group)} className="flex-1 py-5 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white font-black rounded-[1.5rem] transition-all border border-indigo-100 hover:border-indigo-600 flex justify-center items-center shadow-sm group/btn2 group/manage active:scale-95">
                  Analyze Personnel <ChevronRight className="w-5 h-5 ml-2 group-hover/manage:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          );
        })}

        {/* 🈳 EMPTY DOSSIER VIEW */}
        {filteredSessions.length === 0 && (
          <div className="col-span-full py-32 text-center bg-white/50 backdrop-blur rounded-[4rem] border-4 border-dashed border-slate-100 flex flex-col items-center justify-center">
            <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mb-6">
              <Activity className="w-12 h-12 text-slate-200" />
            </div>
            <p className="text-slate-400 font-black text-2xl uppercase tracking-tighter">No operational dossiers detected</p>
            <p className="text-slate-300 font-bold mt-2">Initialize your first masterclass to begin intelligence gathering.</p>
          </div>
        )}
      </div>
    </div>
  );

  // ---------------------------------------------------------
  // 🟢 TAB 3: LEADERBOARD UI 
  // ---------------------------------------------------------
  const renderLeaderboard = () => {
    return (
      <div className="animate-in slide-in-from-right-8 duration-500 text-left space-y-12 max-w-5xl mx-auto pb-20">

        {/* 🏆 LEADERBOARD HEADER */}
        <div className="text-center space-y-4 pt-12">
          <div className="inline-flex items-center px-4 py-2 bg-amber-100 text-amber-700 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4 border border-amber-200">
            <Award className="w-3 h-3 mr-2" /> Global Elite Rankings
          </div>
          <h3 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tighter leading-none mb-4">
            Network <span className="bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">Power Rankings</span>
          </h3>
          <p className="text-gray-500 font-bold text-lg max-w-2xl mx-auto">
            Honoring the top 1% of experts who are redefining academic mentorship in the Kuppi Space ecosystem.
          </p>
        </div>

        {/* 🎬 PRESTIGIOUS CINEMATIC PODIUM */}
        <div className="relative group max-w-4xl mx-auto px-4 sm:px-0">
          <div className="absolute -bottom-10 inset-x-0 h-20 bg-indigo-500/10 blur-[100px] rounded-full"></div>

          <div className="flex flex-row justify-center items-end gap-2 md:gap-8 pt-24 pb-12 relative scale-[0.85] sm:scale-100 origin-bottom">
            {/* 🥈 Silver - 2nd Place */}
            {globalRankedMentors[1] && (
              <div className="flex flex-col items-center order-2 md:order-1 relative z-10 group/podium animate-in slide-in-from-left-8 duration-700">
                <div className="relative mb-[-1rem] z-20">
                  <div className="w-24 h-24 md:w-32 md:h-32 bg-white p-1.5 rounded-[2.5rem] shadow-2xl group-hover/podium:-translate-y-3 transition-transform duration-500 border border-slate-200 ring-4 ring-slate-100">
                    <div className="w-full h-full bg-slate-50 rounded-[2rem] overflow-hidden flex items-center justify-center text-slate-400 font-black text-4xl border border-slate-200">
                      {globalRankedMentors[1].avatar ? <img src={globalRankedMentors[1].avatar} alt="avatar" className="w-full h-full object-cover" /> : globalRankedMentors[1].initial}
                    </div>
                  </div>
                  <div className="absolute -top-3 -left-3 w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-500 font-black text-xs shadow-lg border border-slate-200 backdrop-blur-md">2</div>
                </div>
                <div className="w-36 md:w-48 h-32 bg-gradient-to-b from-slate-200 via-slate-50 to-white rounded-t-[3rem] border border-slate-200 flex flex-col items-center justify-center pt-8 shadow-inner">
                  <span className="text-lg font-black text-slate-800 tracking-tighter">{globalRankedMentors[1].xp}</span>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Growth XP</span>
                </div>
                <div className="mt-4 flex flex-col items-center">
                  <p className="font-black text-slate-900 text-lg leading-none">{globalRankedMentors[1].name.split(' ')[0]}</p>
                </div>
              </div>
            )}

            {/* 🥇 Gold - 1st Place */}
            {globalRankedMentors[0] && (
              <div className="flex flex-col items-center order-1 md:order-2 relative z-20 group/podium animate-in slide-in-from-bottom-8 duration-1000">
                <div className="absolute -top-20 z-30 flex flex-col items-center">
                  <Crown className="w-12 h-12 text-amber-500 fill-amber-500 animate-bounce" />
                </div>

                <div className="relative mb-[-1.5rem] z-20">
                  <div className="w-32 h-32 md:w-44 md:h-44 bg-white p-2 rounded-[3.5rem] shadow-2xl group-hover/podium:-translate-y-5 transition-transform duration-700 border-2 border-amber-300 ring-8 ring-amber-50">
                    <div className="w-full h-full bg-amber-50 rounded-[3rem] overflow-hidden flex items-center justify-center text-amber-600 font-black text-6xl border-2 border-amber-200">
                      {globalRankedMentors[0].avatar ? <img src={globalRankedMentors[0].avatar} alt="avatar" className="w-full h-full object-cover" /> : globalRankedMentors[0].initial}
                    </div>
                  </div>
                  <div className="absolute -top-4 -left-4 w-14 h-14 bg-amber-500 rounded-[1.5rem] flex items-center justify-center text-white font-black text-xl shadow-xl border-4 border-white rotate-[-12deg]">1</div>
                </div>
                <div className="w-44 md:w-64 h-48 bg-gradient-to-b from-amber-200 via-amber-50 to-white rounded-t-[4rem] border-2 border-amber-300/50 flex flex-col items-center justify-center pt-10 shadow-2xl relative">
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>
                  <span className="text-3xl font-black text-amber-900 tracking-tighter">{globalRankedMentors[0].xp}</span>
                  <span className="text-[10px] font-black text-amber-600 uppercase tracking-[0.4em] mt-1">Apex Legend</span>
                </div>
                <div className="mt-6 flex flex-col items-center">
                  <p className="font-black text-slate-950 text-2xl tracking-tighter">{globalRankedMentors[0].name.split(' ')[0]}</p>
                </div>
              </div>
            )}

            {/* 🥉 Bronze - 3rd Place */}
            {globalRankedMentors[2] && (
              <div className="flex flex-col items-center order-3 relative z-10 group/podium animate-in slide-in-from-right-8 duration-700">
                <div className="relative mb-[-1rem] z-20">
                  <div className="w-24 h-24 md:w-32 md:h-32 bg-white p-1.5 rounded-[2.5rem] shadow-2xl group-hover/podium:-translate-y-3 transition-transform duration-500 border border-orange-200 ring-4 ring-orange-50">
                    <div className="w-full h-full bg-orange-50 rounded-[2rem] overflow-hidden flex items-center justify-center text-orange-400 font-black text-4xl border border-orange-200">
                      {globalRankedMentors[2].avatar ? <img src={globalRankedMentors[2].avatar} alt="avatar" className="w-full h-full object-cover" /> : globalRankedMentors[2].initial}
                    </div>
                  </div>
                  <div className="absolute -top-3 -left-3 w-10 h-10 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 font-black text-xs shadow-lg border border-orange-200 backdrop-blur-md">3</div>
                </div>
                <div className="w-36 md:w-48 h-28 bg-gradient-to-b from-orange-200 via-orange-50 to-white rounded-t-[3rem] border border-orange-200 flex flex-col items-center justify-center pt-8 shadow-inner">
                  <span className="text-lg font-black text-orange-800 tracking-tighter">{globalRankedMentors[2].xp}</span>
                  <span className="text-[9px] font-black text-orange-400 uppercase tracking-widest">Impact XP</span>
                </div>
                <div className="mt-4 flex flex-col items-center">
                  <p className="font-black text-slate-900 text-lg leading-none">{globalRankedMentors[2].name.split(' ')[0]}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 📋 DETAILED RANKING LIST */}
        <div className="bg-white rounded-[3.5rem] shadow-2xl shadow-indigo-100/50 border border-gray-100 overflow-hidden mt-10">
          <div className="px-10 py-8 bg-[#0f172a] text-white flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10">
                <Target className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <h4 className="font-black text-xl tracking-tight">Expert Standings</h4>
                <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest">Season 04 • Live Updates</p>
              </div>
            </div>
            <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
              <button className="px-5 py-2.5 bg-white text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg">Global</button>
              <button className="px-5 py-2.5 text-indigo-300 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors">By Impact</button>
            </div>
          </div>

          <div className="p-4 sm:p-6 space-y-4 bg-gray-50/30">
            {globalRankedMentors.map((mentor, index) => {
              const rank = index + 1;
              const isTop3 = rank <= 3;
              return (
                <div
                  key={mentor.id}
                  className={`relative flex items-center p-6 rounded-[2.5rem] transition-all duration-300 group cursor-default border ${mentor.isMe ? 'bg-white border-indigo-200 shadow-[0_10px_30px_rgba(79,70,229,0.15)] ring-4 ring-indigo-50 -translate-y-1' : 'bg-white border-gray-100 hover:shadow-xl hover:border-indigo-100 hover:-translate-y-1'}`}
                >
                  {/* Rank Badge */}
                  <div className="w-12 h-12 flex items-center justify-center mr-6 shrink-0">
                    {rank === 1 ? <div className="text-4xl animate-pulse">🥇</div> :
                      rank === 2 ? <div className="text-4xl">🥈</div> :
                        rank === 3 ? <div className="text-4xl">🥉</div> :
                          <span className="text-lg font-black text-slate-300 border-2 border-slate-100 w-10 h-10 rounded-2xl flex items-center justify-center">{rank}</span>}
                  </div>

                  {/* Avatar */}
                  <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center font-black text-2xl mr-6 transition-all duration-500 overflow-hidden shrink-0 ${mentor.isMe ? 'ring-4 ring-indigo-100 border-2 border-indigo-600 scale-110 shadow-lg' : 'border border-gray-100 group-hover:scale-105 group-hover:shadow-lg'}`}>
                    {mentor.avatar ? (
                      <img src={mentor.avatar} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center ${mentor.isMe ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600'}`}>
                        {mentor.initial}
                      </div>
                    )}
                  </div>

                  {/* Name & Status */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                      <p className="font-black text-xl text-slate-900 truncate leading-none">{mentor.name}</p>
                      {mentor.isMe && <span className="px-3 py-1 bg-indigo-600 text-white text-[8px] font-black uppercase tracking-[0.2em] rounded-lg shadow-lg shadow-indigo-500/20">YOU</span>}
                      {isTop3 && <span className="px-3 py-1 bg-amber-100 text-amber-700 text-[8px] font-black uppercase tracking-[0.2em] rounded-lg border border-amber-200">Elite</span>}
                    </div>
                    <div className="flex items-center space-x-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <span className="flex items-center"><Zap className="w-3 h-3 mr-1 text-indigo-500" /> {mentor.level}</span>
                      <span className="flex items-center"><Star className="w-3 h-3 mr-1 text-amber-400" /> Top 1%</span>
                    </div>
                  </div>

                  {/* XP & Trend */}
                  <div className="text-right ml-4 shrink-0">
                    <div className="flex items-center justify-end space-x-2">
                      <p className={`font-black text-4xl tracking-tighter transition-colors ${mentor.isMe ? 'text-indigo-600' : 'text-slate-900 group-hover:text-indigo-600'}`}>
                        {mentor.xp}
                      </p>
                      <TrendingUp className={`w-5 h-5 ${rank === 1 ? 'text-emerald-500' : 'text-blue-500 opacity-50'}`} />
                    </div>
                    <div className="w-32 bg-gray-100 h-1.5 rounded-full mt-2 overflow-hidden shadow-inner">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${mentor.isMe ? 'bg-indigo-600' : 'bg-slate-400 group-hover:bg-indigo-400'}`}
                        style={{ width: `${Math.min((mentor.xp / 5000) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}

            {globalRankedMentors.length === 0 && (
              <div className="py-10 text-center text-gray-500 font-bold">No mentors found.</div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ---------------------------------------------------------
  // 🟢 TAB 5: PREMIUM SETTINGS UI
  // ---------------------------------------------------------
  const renderSettings = () => (
    <div className="animate-in slide-in-from-right-8 duration-700 text-left space-y-12 max-w-5xl mx-auto pb-12">

      {/* ⚙️ SETTINGS HEADER */}
      <div className="bg-gradient-to-br from-[#0f172a] to-blue-900 rounded-[3.5rem] p-12 text-white shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-[70px] -mr-16 -mt-16 group-hover:bg-indigo-500/20 transition-all duration-700"></div>
        <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
          <div className="w-28 h-28 bg-white/10 rounded-[2.5rem] flex items-center justify-center border border-white/20 backdrop-blur-xl shadow-inner">
            <Settings className="w-14 h-14 text-indigo-300 animate-spin-slow" />
          </div>
          <div>
            <div className="inline-flex items-center px-4 py-1.5 bg-indigo-500/20 text-indigo-200 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4 border border-white/10 shadow-sm">
              <ShieldCheck className="w-4 h-4 mr-2" /> Global Protocol Management
            </div>
            <h3 className="text-5xl font-black mb-3 tracking-tighter">Command <span className="text-indigo-400">Settings</span></h3>
            <p className="text-indigo-200/70 font-medium text-lg leading-relaxed max-w-xl">
              Configure your operational profile, security protocols, and system notification preferences.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">

        {/* 📟 SIDE NAVIGATION */}
        <div className="w-full lg:w-80 space-y-4">
          {[
            { id: 'profile', label: 'Executive Profile', icon: User },
            { id: 'security', label: 'Security Protocols', icon: Key },
            { id: 'notifications', label: 'Alert Parameters', icon: BellRing }
          ].map(tab => {
            const isActive = settingsTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSettingsTab(tab.id)}
                className={`flex items-center w-full px-8 py-6 rounded-[2.5rem] font-black transition-all duration-500 border-none outline-none group relative overflow-hidden ${isActive ? 'bg-[#1e3a8a] text-white shadow-2xl shadow-indigo-200 translate-x-2' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
              >
                {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-indigo-500 rounded-r-full"></div>}
                <div className={`p-3 rounded-2xl mr-5 transition-all duration-500 ${isActive ? 'bg-indigo-500/20 text-indigo-300 scale-110 shadow-lg shadow-indigo-900/50' : 'bg-slate-100 group-hover:bg-white shadow-sm'}`}>
                  <tab.icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-indigo-300' : 'text-slate-400'}`} />
                </div>
                <span className="whitespace-nowrap text-sm uppercase tracking-widest">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* 📂 SETTINGS CONTENT AREA */}
        <div className="flex-1 bg-white/70 backdrop-blur-xl rounded-[4rem] shadow-2xl shadow-indigo-100/30 border border-indigo-50 p-8 sm:p-14 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-bl-full -z-10 opacity-30 transform translate-x-10 -translate-y-10"></div>

          {settingsTab === 'profile' && (
            <div className="animate-in fade-in duration-700">
              {/* Profile Intelligence Header */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-10 mb-14">
                <div className="relative group">
                  <div className="absolute -inset-2 bg-gradient-to-tr from-indigo-500 to-blue-600 rounded-[3.5rem] opacity-20 blur-lg group-hover:opacity-40 transition-opacity"></div>
                  <div className="w-40 h-40 rounded-[3rem] bg-[#1e3a8a] flex items-center justify-center text-white text-6xl font-black shadow-2xl group-hover:scale-105 transition-all duration-500 overflow-hidden border-4 border-white relative z-10">
                    {user?.avatar ? (
                      <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      user?.name ? user.name.charAt(0).toUpperCase() : 'E'
                    )}
                  </div>
                  <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} className="hidden" accept="image/*" />
                  <button onClick={() => fileInputRef.current.click()} className="absolute -bottom-4 -right-4 p-4 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-500/50 border-2 border-white hover:bg-indigo-500 hover:scale-110 transition-all z-20 group-active:scale-95">
                    <Camera className="w-6 h-6" />
                  </button>
                </div>
                <div className="text-center sm:text-left mt-4 sm:mt-0 pt-4">
                  <h4 className="text-4xl font-black text-slate-900 tracking-tighter mb-2 leading-none">{user?.name || 'Senior Expert'}</h4>
                  <p className="text-slate-400 font-bold mb-6 text-xl leading-none">{user?.email}</p>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                    <span className="px-5 py-2.5 bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase tracking-[0.2em] rounded-2xl border border-indigo-100 flex items-center shadow-sm"><ShieldCheck className="w-3.5 h-3.5 mr-2" /> Verified Operative</span>
                    <span className="px-5 py-2.5 bg-[#1e3a8a] text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-2xl border border-blue-800 flex items-center shadow-lg"><Sparkles className="w-3.5 h-3.5 mr-2 text-indigo-400" /> Tier 1 Mentor</span>
                  </div>
                </div>
              </div>

              {/* Intelligence Dossier Form */}
              <form onSubmit={handleProfileUpdate} className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2 block">Full Designation</label>
                    <div className="relative group/input">
                      <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within/input:text-indigo-500 transition-colors" />
                      <input type="text" value={profileData.name} onChange={(e) => setProfileData({ ...profileData, name: e.target.value })} className="w-full pl-16 pr-6 py-5 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold text-slate-900 focus:bg-white focus:border-indigo-400 shadow-sm outline-none transition-all placeholder-slate-300" placeholder="Agent Name" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2 block">Identifier Email</label>
                    <div className="relative">
                      <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                      <input type="email" defaultValue={user?.email || ''} readOnly className="w-full pl-16 pr-6 py-5 bg-slate-100 border-2 border-transparent text-slate-400 rounded-2xl font-bold cursor-not-allowed opacity-60" />
                    </div>
                  </div>
                  <div className="space-y-4 md:col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2 block">Expertise Archetype</label>
                    <div className="relative group/input">
                      <Briefcase className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within/input:text-indigo-600 transition-colors" />
                      <input type="text" value={profileData.headline} onChange={(e) => setProfileData({ ...profileData, headline: e.target.value })} placeholder="e.g. Lead Systems Architect, Neural Network Expert" className="w-full pl-16 pr-6 py-5 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold text-slate-900 focus:bg-white focus:border-indigo-400 shadow-sm outline-none transition-all placeholder-slate-300" />
                    </div>
                  </div>
                  <div className="space-y-4 md:col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2 block">Mentorship Intelligence Dossier</label>
                    <textarea rows="5" value={profileData.bio} onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })} placeholder="Synthesize your mentorship methodology and historical impact..." className="w-full p-8 bg-slate-50 border-2 border-slate-50 rounded-3xl font-bold text-slate-900 focus:bg-white focus:border-indigo-400 shadow-sm outline-none transition-all resize-none placeholder-slate-300 min-h-[160px]"></textarea>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2 block">Primary Industry Sector</label>
                    <div className="relative group/input">
                      <Globe className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within/input:text-indigo-600 transition-colors" />
                      <input type="text" value={profileData.industry} onChange={(e) => setProfileData({ ...profileData, industry: e.target.value })} placeholder="e.g. Distributed Computing, FinTech Operations" className="w-full pl-16 pr-6 py-5 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold text-slate-900 focus:bg-white focus:border-indigo-400 shadow-sm outline-none transition-all placeholder-slate-300" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2 block">Communication Protocols</label>
                    <div className="relative group/input">
                      <MessageSquare className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within/input:text-indigo-600 transition-colors" />
                      <input type="text" value={profileData.languages} onChange={(e) => setProfileData({ ...profileData, languages: e.target.value })} placeholder="e.g. English, Sinhala, Neural Link" className="w-full pl-16 pr-6 py-5 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold text-slate-900 focus:bg-white focus:border-indigo-400 shadow-sm outline-none transition-all placeholder-slate-300" />
                    </div>
                  </div>
                  <div className="space-y-4 md:col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2 block">Core Technology Vector (CSV)</label>
                    <div className="relative group/input">
                      <Code className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within/input:text-indigo-600 transition-colors" />
                      <input type="text" value={profileData.skills} onChange={(e) => setProfileData({ ...profileData, skills: e.target.value })} placeholder="React, Kubernetes, TensorFlow, Golang" className="w-full pl-16 pr-6 py-5 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold text-slate-900 focus:bg-white focus:border-indigo-400 shadow-sm outline-none transition-all placeholder-slate-300" />
                    </div>
                  </div>
                </div>

                <div className="pt-8 flex justify-end">
                  <button type="submit" disabled={isSavingProfile} className="px-12 py-5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-[0.2em] rounded-[1.8rem] shadow-2xl shadow-indigo-500/40 transition-all flex items-center hover:-translate-y-1 disabled:opacity-50 active:scale-95">
                    {isSavingProfile ? 'Synchronizing...' : 'Update Intelligence Docket'} <Save className="w-5 h-5 ml-4" />
                  </button>
                </div>
              </form>
            </div>
          )}

          {settingsTab === 'security' && (
            <div className="animate-in fade-in duration-700 space-y-12">
              <div className="flex items-center gap-6 p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 mb-10">
                <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center">
                  <Lock className="w-7 h-7 text-indigo-600" />
                </div>
                <div>
                  <h4 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-2">Security Protocols</h4>
                  <p className="text-slate-400 font-bold text-sm">Update your access credentials to maintain operational security.</p>
                </div>
              </div>

              <form onSubmit={handlePasswordUpdate} className="space-y-10 max-w-xl pr-6">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2 block">Current Encryption Key</label>
                  <div className="relative group/input">
                    <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within/input:text-indigo-600 transition-colors" />
                    <input
                      required
                      type="password"
                      placeholder="••••••••"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className="w-full pl-16 pr-6 py-5 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold text-slate-900 focus:bg-white focus:border-indigo-400 shadow-sm outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2 block">New Encryption Key</label>
                  <div className="relative group/input">
                    <Key className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within/input:text-indigo-600 transition-colors" />
                    <input
                      required
                      type="password"
                      placeholder="••••••••"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="w-full pl-16 pr-6 py-5 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold text-slate-900 focus:bg-white focus:border-indigo-400 shadow-sm outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2 block">Confirm New Key</label>
                  <div className="relative group/input">
                    <ShieldAlert className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within/input:text-indigo-600 transition-colors" />
                    <input
                      required
                      type="password"
                      placeholder="••••••••"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="w-full pl-16 pr-6 py-5 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold text-slate-900 focus:bg-white focus:border-indigo-400 shadow-sm outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="pt-8">
                  <button type="submit" disabled={isSavingPassword} className="px-12 py-5 bg-[#1e3a8a] hover:bg-indigo-600 text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl transition-all flex items-center hover:-translate-y-1 disabled:opacity-50 active:scale-95">
                    {isSavingPassword ? 'Recalibrating...' : 'Update Security Key'} <Zap className="w-5 h-5 ml-4 text-indigo-400" />
                  </button>
                </div>
              </form>
            </div>
          )}

          {settingsTab === 'notifications' && (
            <div className="animate-in fade-in duration-700 space-y-12">
              <div className="flex items-center gap-6 p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 mb-10">
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
                  <div key={i} onClick={item.toggle} className={`flex items-center justify-between p-8 bg-white border rounded-[2rem] hover:shadow-xl hover:shadow-slate-100 transition-all group cursor-pointer duration-500 ${item.state ? 'border-indigo-200 shadow-indigo-50' : 'border-slate-100'}`}>
                    <div className="flex items-center gap-6">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${item.state ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600'}`}>
                        <item.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-black text-slate-900 uppercase tracking-widest text-xs mb-1">{item.label}</p>
                        <p className="text-slate-400 font-bold text-xs">{item.desc}</p>
                      </div>
                    </div>
                    <div className="relative inline-flex items-center cursor-pointer group/switch">
                      <div className={`w-16 h-8 rounded-full shadow-inner transition-all duration-500 relative ${item.state ? 'bg-indigo-600' : 'bg-slate-200'}`}>
                        <div className={`w-6 h-6 bg-white rounded-full absolute top-1 shadow-md transition-all duration-500 ${item.state ? 'right-1' : 'left-1'}`}></div>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="pt-10 flex justify-end">
                  <button onClick={handleSavePreferences} disabled={isSavingPreferences} className="px-10 py-5 bg-[#1e3a8a] hover:bg-indigo-600 text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl shadow-2xl transition-all flex items-center hover:-translate-y-1 disabled:opacity-50 active:scale-95 group/save">
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

  if (!user || loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F7FE]">
      <div className="flex flex-col items-center">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-indigo-200 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <p className="mt-4 text-indigo-900 font-bold tracking-widest text-sm uppercase animate-pulse">Loading Workspace...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col w-full max-w-full overflow-x-hidden nexus-mesh font-sans text-gray-800 selection:bg-indigo-100 selection:text-indigo-900 relative">
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

        .glass-dark {
          background: rgba(15, 23, 42, 0.8);
          backdrop-filter: blur(24px) saturate(160%);
          -webkit-backdrop-filter: blur(24px) saturate(160%);
          border: 1px solid rgba(255, 255, 255, 0.1);
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
          className="fixed top-[68px] left-0 h-[calc(100vh-68px)] ml-6 glass-premium rounded-t-[2.5rem] hidden md:flex flex-col justify-between shadow-[0_10px_40px_rgba(0,0,0,0.04)] z-[150] border-x border-t border-white py-6 overflow-hidden transition-all duration-300"
          style={{ width: sidebarOpen ? '240px' : '78px' }}
        >
          <div className="flex flex-col w-full">
            <div className="flex flex-col w-full px-3 gap-2 mt-4">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                { id: 'sessions', label: 'My Sessions', icon: BookOpen },
                { id: 'leaderboard', label: 'Rankings', icon: Award },
                { id: 'inbox', label: 'Messages', icon: Inbox, badge: unreadMessagesCount },
                { id: 'settings', label: 'Settings', icon: Settings },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative flex items-center w-full px-4 py-4 rounded-2xl text-sm font-bold transition-all border-none outline-none group/link ${activeTab === item.id ? 'bg-[#1e3a8a] text-white shadow-md' : 'text-slate-500 hover:bg-indigo-50 hover:text-indigo-600'}`}
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

        {/* 🟢 MAIN CONTENT AREA */}
        <main className={`flex-1 flex flex-col w-full relative z-10 min-h-screen transition-all duration-300 ${sidebarOpen ? 'md:pl-[280px]' : 'md:pl-[120px]'}`}>

          <header className="w-full h-28 flex items-center justify-between px-8 sticky top-[68px] z-[100] glass-premium transition-all border-b border-white/50 shadow-sm backdrop-blur-xl">

            {/* 🔴 CONDITIONAL RENDERING FOR SEARCH BAR */}
            {activeTab === 'dashboard' ? (
              <div className="relative w-[28rem] hidden sm:block group">
                <Search className="w-5 h-5 absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                <input type="text" value={globalSearch} onChange={(e) => setGlobalSearch(e.target.value)} placeholder="Search your dashboard..." className="w-full pl-14 pr-4 py-4 bg-white border-2 border-transparent focus:border-indigo-200 rounded-2xl outline-none text-sm font-bold text-gray-700 shadow-sm transition-all focus:shadow-md" />
              </div>
            ) : (
              <div></div> /* Empty div to keep flex-between spacing */
            )}

            <div className="flex items-center space-x-6 ml-auto">
              <div className="relative">
                <button onClick={handleToggleNotifications} className={`relative p-4 transition-all duration-300 bg-white rounded-2xl shadow-sm border ${showNotifs ? 'text-indigo-600 border-indigo-200' : 'text-gray-400 border-gray-100 hover:border-indigo-100 hover:scale-105 active:scale-95'}`}>
                  <BellRing className={`w-6 h-6 ${showNotifs ? 'animate-none' : 'group-hover:animate-swing'}`} />
                  {(totalRequests > 0 || unreadMessagesCount > 0) && (
                    <div className="absolute top-3 right-3 flex items-center justify-center">
                      <span className="absolute w-4 h-4 bg-blue-500 rounded-full border-2 border-white animate-ping opacity-75"></span>
                      <span className="relative w-3.5 h-3.5 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center text-[7px] font-black text-white">
                        {totalRequests + unreadMessagesCount}
                      </span>
                    </div>
                  )}
                </button>
                {showNotifs && (
                  <div className="absolute top-16 right-0 w-80 bg-white rounded-[2rem] shadow-2xl border border-gray-100 p-5 z-[200] animate-in slide-in-from-top-4">
                    <div className="flex items-center justify-between mb-6 px-2">
                      <h4 className="font-extrabold text-[#111827] text-lg">Notifications</h4>
                      <button onClick={() => setShowNotifs(false)} className="p-1.5 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"><X className="w-4 h-4 text-gray-500" /></button>
                    </div>

                    <div className="space-y-3 max-h-[350px] overflow-y-auto no-scrollbar pb-2">
                      {totalRequests > 0 && (
                        <div
                          onClick={() => { setActiveTab('dashboard'); setShowNotifs(false); }}
                          className="group p-4 bg-gradient-to-br from-indigo-50 to-white rounded-[1.5rem] border border-indigo-100 cursor-pointer hover:shadow-lg hover:border-indigo-300 transition-all duration-300"
                        >
                          <div className="flex items-center mb-2">
                            <div className="p-2 bg-indigo-600 rounded-xl mr-3 shadow-lg shadow-indigo-500/20"><Users className="w-4 h-4 text-white" /></div>
                            <p className="text-sm font-black text-[#1e1b4b]">{totalRequests} Pending Requests</p>
                          </div>
                          <p className="text-[11px] font-medium text-slate-500 leading-relaxed pl-11">Review students waiting to join your module.</p>
                        </div>
                      )}

                      {unreadMessagesCount > 0 && (
                        <div
                          onClick={() => { setActiveTab('inbox'); setShowNotifs(false); }}
                          className="group p-4 bg-gradient-to-br from-blue-50 to-white rounded-[1.5rem] border border-blue-100 cursor-pointer hover:shadow-lg hover:border-blue-300 transition-all duration-300"
                        >
                          <div className="flex items-center mb-2">
                            <div className="p-2 bg-blue-600 rounded-xl mr-3 shadow-lg shadow-blue-500/20"><MessageSquare className="w-4 h-4 text-white" /></div>
                            <p className="text-sm font-black text-[#1e1b4b]">{unreadMessagesCount} Unread Messages</p>
                          </div>
                          <p className="text-[11px] font-medium text-slate-500 leading-relaxed pl-11">Respond to your students' latest questions.</p>
                        </div>
                      )}

                      {totalRequests === 0 && unreadMessagesCount === 0 && (
                        <div className="py-12 text-center flex flex-col items-center">
                          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-dashed border-slate-200">
                            <CheckCheck className="w-8 h-8 text-emerald-400" />
                          </div>
                          <h5 className="text-sm font-black text-[#111827]">All caught up!</h5>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">No new alerts to show</p>
                        </div>
                      )}
                    </div>

                    {(totalRequests > 0 || unreadMessagesCount > 0) && (
                      <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center px-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recent Activity</span>
                        <button onClick={() => { setShowNotifs(false); setActiveTab('settings'); }} className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">Manage Rules</button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="relative">
                <div onClick={() => setShowProfile(!showProfile)} className={`flex items-center p-2 pr-6 bg-white rounded-[1.5rem] shadow-sm border cursor-pointer hover:shadow-md transition-all ${showProfile ? 'border-indigo-300' : 'border-gray-100 hover:border-indigo-100'}`}>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white font-black text-xl mr-4 shadow-inner overflow-hidden">
                    {user?.avatar ? <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" /> : (user?.name ? user.name.charAt(0).toUpperCase() : 'M')}
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-black text-gray-900 leading-tight">{user?.name ? user.name.split(' ')[0] : 'Mentor'}</p>
                    <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest mt-0.5">Senior Expert</p>
                  </div>
                </div>

                {showProfile && (
                  <div className="absolute top-20 right-0 w-64 bg-white rounded-[2rem] shadow-2xl border border-gray-100 p-3 z-50 animate-in slide-in-from-top-4">
                    <div className="flex items-center p-4 mb-2 bg-gray-50 rounded-2xl">
                      <div className="w-14 h-14 bg-indigo-100 rounded-xl text-indigo-600 flex items-center justify-center font-black text-2xl mr-4 overflow-hidden border border-indigo-200">
                        {user?.avatar ? <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" /> : (user?.name ? user.name.charAt(0).toUpperCase() : 'M')}
                      </div>
                      <div>
                        <p className="font-black text-gray-900 leading-tight text-lg truncate w-28">{user?.name ? user.name.split(' ')[0] : 'Mentor'}</p>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Verified Tier</p>
                      </div>
                    </div>
                    <div className="px-2 pb-2">
                      <button onClick={() => { setActiveTab('settings'); setShowProfile(false); }} className="w-full text-left px-4 py-3 rounded-xl text-gray-700 font-bold hover:bg-indigo-50 hover:text-indigo-600 transition-colors flex items-center text-sm">
                        <User className="w-4 h-4 mr-3" /> Mentor Profile
                      </button>
                    </div>
                    <hr className="border-gray-100 mb-2" />
                    <button onClick={handleLogout} className="w-full text-left px-5 py-4 rounded-xl text-blue-600 font-black hover:bg-blue-50 transition-colors flex items-center text-sm">
                      <LogOut className="w-5 h-5 mr-3" /> Secure Log Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          <div className="p-8 pt-6 max-w-7xl mx-auto w-full relative pb-20">
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'sessions' && renderSessions()}
            {activeTab === 'leaderboard' && renderLeaderboard()}
            {activeTab === 'inbox' && renderInbox()}
            {activeTab === 'settings' && renderSettings()}
          </div>
        </main>
      </div>

      {/* 🔮 ULTRA-MODERN FLOATING ACTION CENTER */}
      <div className="fixed bottom-10 right-10 z-[200] flex flex-col items-end gap-4 group/hub">
        <div className="relative flex flex-col items-end gap-3 pointer-events-none mb-2">
          {[
            { icon: Plus, label: 'Create Session', onClick: () => setIsModalOpen(true), color: 'bg-indigo-600' },
            { icon: Mail, label: 'Broadcast Message', onClick: () => setActiveTab('inbox'), color: 'bg-blue-600' },
            { icon: Award, label: 'Manage Rankings', onClick: () => setActiveTab('leaderboard'), color: 'bg-amber-500' }
          ].map((action, i) => (
            <button
              key={i}
              onClick={action.onClick}
              style={{ transitionDelay: `${i * 100}ms` }}
              className={`flex items-center gap-3 p-3 truncate rounded-2xl text-white font-bold text-xs shadow-2xl transition-all duration-500 opacity-0 translate-y-10 group-hover/hub:opacity-100 group-hover/hub:translate-y-0 group-hover/hub:pointer-events-auto ${action.color}`}
            >
              <action.icon className="w-4 h-4" />
              <span className="pr-2">{action.label}</span>
            </button>
          ))}
        </div>
        <button
          className="w-16 h-16 bg-gradient-to-tr from-[#1e1b4b] to-indigo-600 text-white rounded-[1.5rem] floating-action-shadow flex items-center justify-center hover:scale-110 active:scale-95 transition-all group/btn relative overflow-hidden"
          title="Quick Action Hub"
        >
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/hub:opacity-100 transition-opacity"></div>
          <Activity className="w-7 h-7 group-hover/hub:scale-110 transition-transform" />
        </button>
      </div>

      {/* Final Global Footer */}
      <div className="w-full relative z-[200]">
        <Footer />
      </div>

      {/* Modals */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-[#0f172a]/60 backdrop-blur-md transition-all">
          <div className="bg-white rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.3)] w-full max-w-lg max-h-[90vh] overflow-y-auto border border-white/40 transform transition-all scale-100 opacity-100 no-scrollbar">
            <div className="relative p-8 bg-gradient-to-br from-fuchsia-600 to-indigo-700 text-white text-left overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full mix-blend-overlay filter blur-[50px] opacity-20"></div>
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4 border border-white/30"><LayoutTemplate className="w-6 h-6 text-white" /></div>
                  <h3 className="text-3xl font-black tracking-tight leading-tight mb-1">Upload a Recording</h3>
                  <p className="text-fuchsia-100 font-medium text-sm">Share your recorded knowledge with juniors.</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 bg-black/10 hover:bg-black/20 rounded-full transition-colors"><X className="w-5 h-5 text-white" /></button>
              </div>
            </div>
            <form onSubmit={handleCreateSession} className="p-8 text-left">
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-black text-gray-700 uppercase tracking-widest mb-2">Module / Topic Name</label>
                  <input type="text" required value={formData.module_name} onChange={(e) => setFormData({ ...formData, module_name: e.target.value })} placeholder="e.g., React Basics" className="w-full px-5 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:bg-white focus:border-fuchsia-500 focus:ring-4 focus:ring-fuchsia-500/10 outline-none transition-all font-bold text-gray-900 placeholder-gray-400" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-black text-gray-700 uppercase tracking-widest mb-2">Series/Tag</label>
                    <input type="text" required value={formData.semester} onChange={(e) => setFormData({ ...formData, semester: e.target.value })} placeholder="e.g., Masterclass" className="w-full px-5 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:bg-white focus:border-fuchsia-500 focus:ring-4 focus:ring-fuchsia-500/10 outline-none transition-all font-bold text-gray-900 placeholder-gray-400" />
                  </div>
                  <div>
                    <label className="block text-sm font-black text-gray-700 uppercase tracking-widest mb-2">Capacity</label>
                    <input type="number" min="2" max="50" required value={formData.max_members} onChange={(e) => setFormData({ ...formData, max_members: parseInt(e.target.value) })} className="w-full px-5 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:bg-white focus:border-fuchsia-500 focus:ring-4 focus:ring-fuchsia-500/10 outline-none transition-all font-black text-gray-900 text-center" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-black text-slate-700 uppercase tracking-widest mb-2 flex items-center"><Youtube className="w-4 h-4 mr-2 text-rose-500" /> YouTube Recording Link</label>
                  <input type="url" required value={formData.session_link} onChange={(e) => setFormData({ ...formData, session_link: e.target.value })} placeholder="https://youtube.com/watch?v=..." className="w-full px-5 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:bg-white focus:border-rose-400 outline-none transition-all font-bold text-rose-600 placeholder-gray-400" />
                </div>

                <div className={`p-5 rounded-2xl border-2 transition-all duration-300 ${showQuizInput ? 'bg-fuchsia-50/50 border-fuchsia-200' : 'bg-gray-50 border-gray-100'}`}>
                  <div className="flex items-center justify-between cursor-pointer" onClick={() => { setShowQuizInput(!showQuizInput); if (showQuizInput) setFormData({ ...formData, quiz_link: '' }); }}>
                    <div>
                      <label className="text-sm font-black text-gray-700 uppercase tracking-widest flex items-center cursor-pointer"><Target className={`w-4 h-4 mr-2 ${showQuizInput ? 'text-fuchsia-500' : 'text-gray-400'}`} /> Add a Quiz? (Optional)</label>
                      <p className="text-[10px] text-gray-500 font-bold mt-0.5">Sessions with quizzes get 40% more engagement.</p>
                    </div>
                    <div className={`w-12 h-6 rounded-full relative shadow-inner transition-colors ${showQuizInput ? 'bg-fuchsia-500' : 'bg-gray-300'}`}>
                      <div className={`w-4 h-4 bg-white rounded-full absolute top-1 shadow-sm transition-all ${showQuizInput ? 'right-1' : 'left-1'}`}></div>
                    </div>
                  </div>
                  {showQuizInput && (
                    <div className="mt-4 animate-in slide-in-from-top-2">
                      <input type="url" value={formData.quiz_link} onChange={(e) => setFormData({ ...formData, quiz_link: e.target.value })} placeholder="Paste Google Form link here..." className="w-full px-5 py-3.5 bg-white border-2 border-fuchsia-100 rounded-2xl focus:bg-white focus:border-fuchsia-500 focus:ring-4 focus:ring-fuchsia-500/10 outline-none transition-all font-bold text-fuchsia-600 placeholder-fuchsia-300 shadow-sm" />
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-8 flex space-x-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900 font-black rounded-2xl transition-colors border border-gray-200">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-[2] py-4 bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-700 text-white font-black rounded-2xl transition-all shadow-lg flex items-center justify-center">Publish Recording 🚀</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🔴 SET TIMER MODAL (Fully Functional) */}
      {timerModalOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-[#0f172a]/60 backdrop-blur-md transition-all">
          <div className="bg-white rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.3)] w-full max-w-md overflow-hidden border border-white/40 transform transition-all scale-100 opacity-100">
            <div className="relative p-8 bg-gradient-to-br from-indigo-900 to-blue-900 text-white text-left overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-fuchsia-500 rounded-full mix-blend-overlay filter blur-[50px] opacity-30"></div>
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4 border border-white/20"><Timer className="w-6 h-6 text-fuchsia-300" /></div>
                  <h3 className="text-3xl font-black tracking-tight leading-tight mb-1">Set Countdown</h3>
                  <p className="text-indigo-200 font-medium text-sm">Schedule your next live masterclass.</p>
                </div>
                <button onClick={() => setTimerModalOpen(false)} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"><X className="w-5 h-5 text-white" /></button>
              </div>
            </div>
            <form onSubmit={handleSetTimer} className="p-8 text-left bg-slate-50">
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-black text-slate-700 uppercase tracking-widest mb-2">Select Session</label>
                  <select required value={timerForm.module_name} onChange={(e) => setTimerForm({ ...timerForm, module_name: e.target.value })} className="w-full px-5 py-3.5 bg-white border-2 border-slate-200 rounded-2xl focus:border-fuchsia-500 outline-none transition-all font-bold text-slate-900 shadow-sm appearance-none">
                    <option value="" disabled>Choose a session...</option>
                    {myHostedGroups.map(g => <option key={g._id} value={g.module_name}>{g.module_name}</option>)}
                    <option value="Custom Special Event">Custom Special Event</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-black text-slate-700 uppercase tracking-widest mb-2 flex items-center"><CalendarDays className="w-4 h-4 mr-2" /> Date & Time</label>
                  <input type="datetime-local" required value={timerForm.targetDate} onChange={(e) => setTimerForm({ ...timerForm, targetDate: e.target.value })} className="w-full px-5 py-3.5 bg-white border-2 border-slate-200 rounded-2xl focus:border-fuchsia-500 outline-none transition-all font-bold text-slate-900 shadow-sm" />
                </div>
              </div>
              <div className="mt-8 flex space-x-4">
                <button type="button" onClick={() => { setLiveSession(null); setTimerModalOpen(false); setTimeLeft({ days: '00', hours: '00', mins: '00', secs: '00' }); }} className="flex-1 py-4 bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white font-black rounded-2xl transition-colors border border-rose-100 shadow-sm">Clear Timer</button>
                <button type="submit" className="flex-[2] py-4 bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-black rounded-2xl transition-all shadow-lg flex items-center justify-center">Start Countdown ⏱️</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🔴 EDIT SESSION MODAL */}
      {editModal.isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-[#0f172a]/70 backdrop-blur-md transition-all">
          <div className="bg-white rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.5)] w-full max-w-lg max-h-[90vh] overflow-y-auto border border-indigo-500/30 transform transition-all scale-100 opacity-100 no-scrollbar">
            <div className="relative p-8 bg-gradient-to-br from-indigo-900 to-blue-900 text-white text-left overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500 rounded-full mix-blend-overlay filter blur-[50px] opacity-30"></div>
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4 border border-white/20"><Edit3 className="w-6 h-6 text-indigo-300" /></div>
                  <h3 className="text-3xl font-black tracking-tight leading-tight mb-1">Edit Details</h3>
                  <p className="text-indigo-200 font-medium text-sm">Update module details and capacity.</p>
                </div>
                <button onClick={() => setEditModal({ isOpen: false, groupId: null, formData: null })} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"><X className="w-5 h-5 text-white" /></button>
              </div>
            </div>
            <form onSubmit={handleUpdateSession} className="p-8 text-left bg-slate-50">
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-black text-slate-700 uppercase tracking-widest mb-2">Module Name</label>
                  <input type="text" required value={editModal.formData.module_name} onChange={(e) => setEditModal({ ...editModal, formData: { ...editModal.formData, module_name: e.target.value } })} className="w-full px-5 py-3.5 bg-white border-2 border-slate-200 rounded-2xl focus:border-indigo-500 outline-none transition-all font-bold text-slate-900 shadow-sm" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-black text-slate-700 uppercase tracking-widest mb-2">Series/Tag</label>
                    <input type="text" required value={editModal.formData.semester} onChange={(e) => setEditModal({ ...editModal, formData: { ...editModal.formData, semester: e.target.value } })} className="w-full px-5 py-3.5 bg-white border-2 border-slate-200 rounded-2xl focus:border-indigo-500 outline-none transition-all font-bold text-slate-900 shadow-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-black text-slate-700 uppercase tracking-widest mb-2">Capacity</label>
                    <input type="number" min="2" max="50" required value={editModal.formData.max_members} onChange={(e) => setEditModal({ ...editModal, formData: { ...editModal.formData, max_members: parseInt(e.target.value) } })} className="w-full px-5 py-3.5 bg-white border-2 border-slate-200 rounded-2xl focus:border-indigo-500 outline-none transition-all font-black text-slate-900 text-center shadow-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-black text-slate-700 uppercase tracking-widest mb-2 flex items-center"><Youtube className="w-4 h-4 mr-2 text-rose-500" /> YouTube Recording Link</label>
                  <input type="url" required value={editModal.formData.session_link} onChange={(e) => setEditModal({ ...editModal, formData: { ...editModal.formData, session_link: e.target.value } })} className="w-full px-5 py-3.5 bg-white border-2 border-slate-200 rounded-2xl focus:border-rose-400 outline-none transition-all font-bold text-rose-600 shadow-sm" />
                </div>

                {/* 🔴 Premium Optional Quiz Field with Toggle for Edit */}
                <div className={`p-5 rounded-2xl border-2 transition-all duration-300 ${showEditQuizInput ? 'bg-indigo-50/50 border-indigo-200' : 'bg-gray-50 border-gray-100'}`}>
                  <div className="flex items-center justify-between cursor-pointer" onClick={() => { setShowEditQuizInput(!showEditQuizInput); if (showEditQuizInput) setEditModal({ ...editModal, formData: { ...editModal.formData, quiz_link: '' } }); }}>
                    <div>
                      <label className="text-sm font-black text-gray-700 uppercase tracking-widest flex items-center cursor-pointer"><Target className={`w-4 h-4 mr-2 ${showEditQuizInput ? 'text-indigo-500' : 'text-gray-400'}`} /> Update Quiz? (Optional)</label>
                      <p className="text-[10px] text-gray-500 font-bold mt-0.5">Link a Google Form assessment.</p>
                    </div>
                    <div className={`w-12 h-6 rounded-full relative shadow-inner transition-colors ${showEditQuizInput ? 'bg-indigo-500' : 'bg-gray-300'}`}>
                      <div className={`w-4 h-4 bg-white rounded-full absolute top-1 shadow-sm transition-all ${showEditQuizInput ? 'right-1' : 'left-1'}`}></div>
                    </div>
                  </div>
                  {showEditQuizInput && (
                    <div className="mt-4 animate-in slide-in-from-top-2">
                      <input type="url" value={editModal.formData.quiz_link} onChange={(e) => setEditModal({ ...editModal, formData: { ...editModal.formData, quiz_link: e.target.value } })} placeholder="Paste Google Form link here..." className="w-full px-5 py-3.5 bg-white border-2 border-indigo-100 rounded-2xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold text-indigo-600 placeholder-indigo-300 shadow-sm" />
                    </div>
                  )}
                </div>

              </div>
              <div className="mt-8 flex space-x-4">
                <button type="button" onClick={() => setEditModal({ isOpen: false, groupId: null, formData: null })} className="flex-1 py-4 bg-white text-slate-600 hover:bg-slate-100 font-black rounded-2xl transition-colors border border-slate-200 shadow-sm">Cancel</button>
                <button type="submit" disabled={isUpdating} className="flex-[2] py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl transition-all shadow-lg flex items-center justify-center">Save Changes ✨</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🟢 MANAGE STUDENTS MODAL */}
      {manageModal.isOpen && manageModal.group && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-[#0f172a]/60 backdrop-blur-md transition-all">
          <div className="bg-white rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.3)] w-full max-w-lg overflow-hidden border border-white/40 transform transition-all scale-100 opacity-100">
            <div className="relative p-8 bg-gradient-to-br from-blue-900 to-[#1e3a8a] text-white text-left overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-fuchsia-500 rounded-full mix-blend-overlay filter blur-[50px] opacity-20"></div>
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4 border border-white/20"><Users className="w-6 h-6 text-white" /></div>
                  <h3 className="text-2xl font-black tracking-tight leading-tight mb-1">{manageModal.group.module_name}</h3>
                  <p className="text-gray-400 font-bold text-sm">Enrolled Students ({manageModal.group.current_members.length}/{manageModal.group.max_members})</p>

                  {/* 🟢 PREMIUM DOWNLOAD ACTION */}
                  <div className="mt-4 flex items-center space-x-3">
                    <button
                      onClick={handleDownloadStudents}
                      className="px-4 py-2 bg-white/10 hover:bg-white text-white hover:text-gray-900 text-[10px] font-black uppercase tracking-widest rounded-xl border border-white/20 transition-all flex items-center shadow-lg group"
                    >
                      <Share2 className="w-3.5 h-3.5 mr-2 group-hover:scale-110 transition-transform" /> Export Student List
                    </button>
                  </div>
                </div>
                <button onClick={() => setManageModal({ isOpen: false, group: null, students: [], isLoading: false })} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"><X className="w-5 h-5 text-white" /></button>
              </div>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4 no-scrollbar">
              {/* 🟢 PREMIUM ANALYTICS INSIGHT */}
              {!manageModal.isLoading && manageModal.students.length > 0 && (
                <div className="bg-gradient-to-br from-indigo-50 to-fuchsia-50 rounded-[1.8rem] border border-indigo-100 p-5 mb-6 relative overflow-hidden animate-in fade-in zoom-in duration-500">
                  <div className="absolute -right-5 -bottom-5 w-24 h-24 bg-fuchsia-200/30 rounded-full blur-2xl"></div>
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm mr-4"><TrendingUp className="w-5 h-5 text-indigo-500" /></div>
                      <div>
                        <p className="text-[10px] font-black text-indigo-800 uppercase tracking-widest">Kuppi Plus Insights</p>
                        <p className="text-sm font-bold text-slate-800">Enrollment health is <span className="text-emerald-500">Excellent</span></p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg XP</p>
                      <p className="text-lg font-black text-indigo-600">
                        {Math.round(manageModal.students.reduce((acc, s) => acc + (s.xp || 0), 0) / manageModal.students.length)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {manageModal.isLoading ? (
                <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fuchsia-600"></div></div>
              ) : manageModal.students.length > 0 ? (
                manageModal.students.map((student, index) => (
                  <div key={student._id || index} className="flex flex-col p-4 rounded-2xl border border-gray-100 bg-gray-50/30 transition-all group">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-black mr-4 border border-indigo-200 shrink-0 overflow-hidden">
                          {student.avatar ? <img src={student.avatar} alt="avatar" className="w-full h-full object-cover" /> : (student.name ? student.name.charAt(0).toUpperCase() : 'S')}
                        </div>
                        <div className="flex flex-col justify-center text-left">
                          <h4 className="font-black text-gray-900 text-sm leading-tight">{student.name}</h4>
                          <p className="text-[11px] text-gray-500 font-bold mt-0.5">{student.email}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2 shrink-0">
                        <button onClick={() => handleAwardBadge(student._id, student.name, manageModal.group.module_name)} className="p-2.5 bg-amber-50 text-amber-500 hover:bg-amber-500 hover:text-white rounded-xl transition-all shadow-sm border border-amber-100 flex items-center justify-center" title="Award Badge"><Award className="w-5 h-5" /></button>
                        <button onClick={() => handleRemoveStudent(student._id, student.name)} className="p-2.5 bg-gray-50 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors border border-gray-100 flex items-center justify-center" title="Remove Student"><UserMinus className="w-5 h-5" /></button>
                      </div>
                    </div>
                    {student.badges && student.badges.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3 ml-14">
                        {student.badges.map((badge, i) => (
                          <div key={badge._id || i} className="flex items-center bg-amber-50 text-amber-600 text-[10px] font-black rounded-lg border border-amber-200 shadow-sm overflow-hidden group/badge animate-in slide-in-from-left-2">
                            <button onClick={() => handleUpdateBadge(student._id, badge._id, badge.badgeName)} className="px-2.5 py-1 hover:bg-amber-100 transition-colors flex items-center" title="Click to rename badge">🏆 {badge.badgeName}</button>
                            <button onClick={() => handleDeleteBadge(student._id, badge._id, badge.badgeName)} className="px-1.5 py-1 bg-amber-100/50 hover:bg-rose-500 hover:text-white transition-all border-l border-amber-200" title="Remove badge"><X className="w-3 h-3" /></button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-10"><p className="text-gray-400 font-bold">No students enrolled yet.</p></div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeniorDashboard;
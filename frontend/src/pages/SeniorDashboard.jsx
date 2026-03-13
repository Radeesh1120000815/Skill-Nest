import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  BookOpen, Calendar, Users, BarChart3, 
  LogOut, Bell, Search, Settings, Star, Clock, 
  ChevronRight, Plus, CheckCircle, Target, Zap,
  TrendingUp, Sparkles, UserPlus, X, LayoutTemplate, UserMinus, Award,
  Edit3, Trash2, Youtube, LayoutDashboard, ShieldCheck, Mail, Briefcase, Code,
  Camera, Key, Smartphone, Globe, Lock, User, BellRing, Save, CheckSquare, 
  MessageSquare, Activity, Share2, Lightbulb, Timer, CalendarDays, Inbox, CornerDownRight, Send, CheckCheck
} from 'lucide-react';

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
  const [profileData, setProfileData] = useState({ name: '', headline: '', bio: '' });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

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
  const [formData, setFormData] = useState({ 
    module_name: '', max_members: 10, session_link: '', semester: '', quiz_link: ''    
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 🔴 NEW: Creative Quiz Toggle States
  const [showQuizInput, setShowQuizInput] = useState(false);
  const [showEditQuizInput, setShowEditQuizInput] = useState(false);

  const [editModal, setEditModal] = useState({ isOpen: false, groupId: null, formData: null });
  const [isUpdating, setIsUpdating] = useState(false);

  const [manageModal, setManageModal] = useState({ isOpen: false, group: null, students: [], isLoading: false });

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
      if(saved) setPlatformMessages(JSON.parse(saved));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

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
        headline: localExtras.headline || '',
        bio: localExtras.bio || ''
      }));

      const groupRes = await axios.get('http://localhost:5001/api/groups', config);
      setMyGroups(groupRes.data.reverse()); 

      const mentorRes = await axios.get('http://localhost:5001/api/auth/mentors', config); 
      setGlobalMentors(mentorRes.data);

    } catch (error) {
      console.error("Error fetching mentor data:", error);
      if(error.response && error.response.status === 401) {
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
    if(!replyText.trim()) return;

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
    if(!confirmDel) return;
    const updated = platformMessages.filter(m => m.id !== id);
    setPlatformMessages(updated);
    localStorage.setItem('platformMessages', JSON.stringify(updated));
  };

  const markAsRead = (msgId) => {
    const updated = platformMessages.map(m => m.id === msgId ? {...m, readBySenior: true} : m);
    setPlatformMessages(updated);
    localStorage.setItem('platformMessages', JSON.stringify(updated));
  };

  // Edit specific reply inside the thread array
  const handleEditThreadReply = (threadId, replyId, newText) => {
      if(!newText.trim()) return;
      const updatedMessages = platformMessages.map(m => {
        if (m.id === threadId) {
            const updatedReplies = m.replies.map(r => r.id === replyId ? {...r, text: newText} : r);
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
      if(!confirmDel) return;
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
        if(userInfoStr) {
           const parsed = JSON.parse(userInfoStr);
           parsed.avatar = base64String;
           localStorage.setItem('userInfo', JSON.stringify(parsed));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setTimeout(() => {
      setUser(prev => ({ ...prev, name: profileData.name, headline: profileData.headline, bio: profileData.bio }));
      const userInfoStr = localStorage.getItem('userInfo');
      if(userInfoStr) {
         const parsed = JSON.parse(userInfoStr);
         parsed.name = profileData.name;
         parsed.headline = profileData.headline;
         parsed.bio = profileData.bio;
         localStorage.setItem('userInfo', JSON.stringify(parsed));
      }
      setIsSavingProfile(false);
      alert("✅ Expert Profile updated successfully!");
    }, 800); 
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
      const response = await axios.post(`http://localhost:5001/api/auth/award-badge/${studentId}`, { badgeName }, config );
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
      if(!groupId) return alert("⚠️ Error: Group ID not found!");
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
  const myInbox = platformMessages.filter(m => m.receiverId === user?._id).sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));
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
  const globalRankedMentors = [...globalMentors].map((mentor) => {
    const isMe = mentor._id === user?._id;
    const baseXP = mentor.points || 0;
    const hosted = myGroups.filter(g => (g.senior_id?._id || g.senior_id) === mentor._id).length;
    const students = myGroups.filter(g => (g.senior_id?._id || g.senior_id) === mentor._id).reduce((sum, g) => sum + (g.current_members?.length || 0), 0);
    
    let offset = 0;
    if (mentor._id) { offset = parseInt(mentor._id.toString().slice(-4), 16) || 0; }
    const xp = baseXP + (hosted * 500) + (students * 150) + 3000 + (offset % 500);

    return {
      id: mentor._id,
      name: mentor.name,
      xp: xp, 
      level: "Senior Expert",
      avatar: mentor.avatar, 
      initial: mentor.name ? mentor.name.charAt(0).toUpperCase() : 'M',
      isMe: isMe
    };
  }).sort((a, b) => b.xp - a.xp);

  // Get current user's specific XP and Rank
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
      
      {/* Premium Hero Banner */}
      <div className="relative rounded-[3rem] p-10 md:p-14 text-white shadow-2xl overflow-hidden group border border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#4c1d95]"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.05]"></div>
        <div className="absolute top-0 right-0 -mt-20 w-96 h-96 bg-fuchsia-500 rounded-full mix-blend-screen filter blur-[100px] opacity-40 group-hover:opacity-60 transition-opacity duration-1000"></div>
        <div className="absolute bottom-0 left-20 -mb-20 w-80 h-80 bg-indigo-600 rounded-full mix-blend-screen filter blur-[100px] opacity-40 group-hover:opacity-60 transition-opacity duration-1000"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10 text-left">
          <div className="w-full md:w-2/3">
            <div className="flex items-center space-x-2 mb-4 bg-white/10 w-fit px-4 py-2 rounded-full backdrop-blur-md border border-white/10 shadow-sm">
              <Sparkles className="w-4 h-4 text-fuchsia-300 animate-pulse" />
              <p className="text-fuchsia-100 font-bold tracking-[0.2em] uppercase text-[10px]">{greeting}, {user?.name?.split(' ')[0]}!</p>
            </div>
            <h2 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter leading-[1.05]">
              Inspire the <br/> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 via-purple-300 to-indigo-300">
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
          
          {/* 🔴 Clickable Global Rank Widget with Dynamic XP */}
          <div 
            onClick={() => setActiveTab('leaderboard')}
            className="w-full md:w-auto bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-2xl p-10 rounded-[3rem] border border-white/20 shadow-2xl transform hover:-translate-y-2 hover:scale-[1.02] cursor-pointer transition-all duration-500 relative overflow-hidden group/card"
            title="Click to view full Mentor Leaderboard"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-fuchsia-400 to-indigo-400"></div>
            <div className="flex items-center justify-between mb-6 gap-8">
              <p className="text-sm text-fuchsia-100 font-black uppercase tracking-widest">Global Rank</p>
              <div className="p-3 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl shadow-lg group-hover/card:animate-bounce"><Award className="w-6 h-6 text-white" /></div>
            </div>
            <p className="text-6xl font-black text-white flex items-center tracking-tighter">
              #{myGlobalRank > 0 ? myGlobalRank : '--'}
            </p>
            <p className="text-fuchsia-200 font-bold mb-6 mt-2">{calculatedXP} Total XP Earned</p>
            
            <div className="mt-6 mb-4">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-indigo-200 mb-2">
                <span>Level {currentLevel} Progress</span>
                <span>{calculatedXP} / {nextMilestone}</span>
              </div>
              <div className="w-full bg-black/20 rounded-full h-2 overflow-hidden shadow-inner">
                <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-fuchsia-500 relative transition-all duration-1000" style={{ width: `${xpProgress}%` }}>
                  <div className="absolute top-0 right-0 bottom-0 w-10 bg-white/20 blur-sm animate-pulse"></div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-2">
              <div className="px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-xl inline-flex group-hover/card:bg-emerald-500/30 transition-colors">
                <p className="text-emerald-300 text-xs font-black flex items-center"><Star className="w-3 h-3 mr-1.5 fill-emerald-300"/> 4.9/5.0 Top Rated</p>
              </div>
              <p className="text-[10px] text-fuchsia-300 font-bold uppercase tracking-widest opacity-0 group-hover/card:opacity-100 transition-opacity flex items-center">
                View Rank <ChevronRight className="w-3 h-3 ml-1" />
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex items-center justify-between hover:-translate-y-1 transition-transform group">
          <div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Total Views</p>
            <h4 className="text-3xl font-black text-gray-900 group-hover:text-indigo-600 transition-colors">1.2K</h4>
          </div>
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 border border-indigo-100 shadow-inner group-hover:scale-110 transition-transform"><Activity className="w-6 h-6"/></div>
        </div>
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex items-center justify-between hover:-translate-y-1 transition-transform group">
          <div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Avg Rating</p>
            <h4 className="text-3xl font-black text-gray-900 group-hover:text-amber-500 transition-colors">4.9</h4>
          </div>
          <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-amber-50 rounded-2xl flex items-center justify-center text-amber-500 border border-amber-100 shadow-inner group-hover:scale-110 transition-transform"><Star className="w-6 h-6 fill-amber-400"/></div>
        </div>
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex items-center justify-between hover:-translate-y-1 transition-transform group">
          <div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Total Classes</p>
            <h4 className="text-3xl font-black text-gray-900 group-hover:text-fuchsia-600 transition-colors">{myHostedGroups.length}</h4>
          </div>
          <div className="w-12 h-12 bg-gradient-to-br from-fuchsia-100 to-fuchsia-50 rounded-2xl flex items-center justify-center text-fuchsia-600 border border-fuchsia-100 shadow-inner group-hover:scale-110 transition-transform"><LayoutTemplate className="w-6 h-6"/></div>
        </div>
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex items-center justify-between hover:-translate-y-1 transition-transform group">
          <div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Total Students</p>
            <h4 className="text-3xl font-black text-gray-900 group-hover:text-emerald-500 transition-colors">{totalStudents}</h4>
          </div>
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 border border-emerald-100 shadow-inner group-hover:scale-110 transition-transform"><Users className="w-6 h-6"/></div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        <div className="xl:col-span-2 space-y-8">
          
          <div className="bg-gradient-to-r from-gray-900 to-[#1e1b4b] rounded-[2.5rem] shadow-2xl p-8 text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between group">
             <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-500 rounded-full mix-blend-overlay filter blur-[60px] opacity-30 animate-pulse"></div>
             <button onClick={() => {
                 setTimerForm({ module_name: liveSession?.module_name || '', targetDate: liveSession?.targetDate || '' });
                 setTimerModalOpen(true);
               }} 
               className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-fuchsia-500 rounded-xl transition-colors opacity-0 group-hover:opacity-100" 
               title="Set Live Session Countdown">
               <Edit3 className="w-4 h-4 text-white" />
             </button>

             <div className="relative z-10 mb-6 md:mb-0 w-full md:w-auto">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-2 h-2 bg-rose-500 rounded-full animate-ping"></div>
                  <h3 className="text-xs font-black text-rose-400 uppercase tracking-[0.2em]">Upcoming Live Class</h3>
                </div>
                <h3 className="text-3xl font-black mb-1">{liveSession && liveSession.module_name ? liveSession.module_name : 'No Session Scheduled'}</h3>
                <p className="text-indigo-200 font-medium text-sm">{liveSession && liveSession.targetDate ? 'Prepare your slides and materials.' : 'Click the edit icon to set a countdown.'}</p>
             </div>
             
             {liveSession && liveSession.targetDate ? (
               <div className="relative z-10 flex space-x-3 sm:space-x-4">
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 p-3 sm:p-4 rounded-2xl text-center min-w-[70px] sm:min-w-[80px] shadow-inner">
                    <p className="text-2xl sm:text-3xl font-black text-white">{timeLeft.days}</p>
                    <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Days</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 p-3 sm:p-4 rounded-2xl text-center min-w-[70px] sm:min-w-[80px] shadow-inner">
                    <p className="text-2xl sm:text-3xl font-black text-white">{timeLeft.hours}</p>
                    <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Hrs</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 p-3 sm:p-4 rounded-2xl text-center min-w-[70px] sm:min-w-[80px] shadow-inner">
                    <p className="text-2xl sm:text-3xl font-black text-white">{timeLeft.mins}</p>
                    <p className="text-[9px] sm:text-[10px] font-bold text-fuchsia-300 uppercase tracking-widest mt-1">Min</p>
                  </div>
                  <div className="bg-fuchsia-600/20 backdrop-blur-md border border-fuchsia-500/30 p-3 sm:p-4 rounded-2xl text-center min-w-[70px] sm:min-w-[80px] shadow-inner">
                    <p className="text-2xl sm:text-3xl font-black text-fuchsia-300">{timeLeft.secs}</p>
                    <p className="text-[9px] sm:text-[10px] font-bold text-fuchsia-400 uppercase tracking-widest mt-1">Sec</p>
                  </div>
               </div>
             ) : (
               <div className="relative z-10 flex space-x-4 opacity-50">
                  <div className="bg-white/10 border border-white/20 p-4 rounded-2xl text-center min-w-[80px]"><p className="text-3xl font-black text-white">00</p><p className="text-[10px] font-bold text-gray-400 mt-1">Days</p></div>
                  <div className="bg-white/10 border border-white/20 p-4 rounded-2xl text-center min-w-[80px]"><p className="text-3xl font-black text-white">00</p><p className="text-[10px] font-bold text-gray-400 mt-1">Hrs</p></div>
                  <div className="bg-white/10 border border-white/20 p-4 rounded-2xl text-center min-w-[80px]"><p className="text-3xl font-black text-white">00</p><p className="text-[10px] font-bold text-gray-400 mt-1">Min</p></div>
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
                  <div key={group._id} className="bg-white p-7 rounded-[2.5rem] shadow-sm border border-gray-100 hover:border-fuchsia-200 transition-all duration-300 group relative overflow-hidden text-left flex flex-col md:flex-row justify-between md:items-center">
                    <div className={`absolute top-0 right-0 w-32 h-32 rounded-bl-full -z-10 transition-transform duration-700 ${isAlt ? 'bg-indigo-50 group-hover:scale-[1.3]' : 'bg-fuchsia-50 group-hover:scale-[1.3]'}`}></div>
                    
                    <div className="flex-1 pr-6 mb-6 md:mb-0 relative">
                      <span className={`inline-block px-4 py-1.5 rounded-xl text-xs font-black tracking-widest border uppercase mb-4 ${isAlt ? 'bg-indigo-100/80 text-indigo-700 border-indigo-200' : 'bg-fuchsia-100/80 text-fuchsia-700 border-fuchsia-200'}`}>
                        {group.semester || 'Masterclass'}
                      </span>
                      <h4 className="font-black text-gray-900 text-2xl mb-2 leading-tight pr-6">{group.module_name}</h4>
                      <p className="text-gray-500 font-semibold text-sm flex items-center"><Youtube className="w-4 h-4 mr-2 text-rose-500" /> YouTube Recording</p>
                    </div>
                    
                    <div className="w-full md:w-64 flex flex-col justify-end">
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-xs font-black text-gray-500 uppercase tracking-wider">Enrollments</span>
                        <span className="text-sm font-black text-fuchsia-600">{group.current_members.length} / {group.max_members}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden mb-4">
                        <div className={`h-full rounded-full transition-all duration-1000 ${fillPercentage >= 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-fuchsia-500 to-indigo-500'}`} style={{ width: `${fillPercentage}%` }}></div>
                      </div>
                      <div className="flex space-x-2">
                        <button onClick={() => copyToClipboard(group.session_link)} className="p-3 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-xl transition-colors border border-indigo-100" title="Copy Invite Link">
                           <Share2 className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleManageStudents(group)} className="flex-1 py-3 bg-fuchsia-50 hover:bg-fuchsia-600 text-fuchsia-700 hover:text-white font-black rounded-xl transition-all border border-fuchsia-100 flex justify-center items-center group/btn">
                          Students <ChevronRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
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
              Recent Feedback <MessageSquare className="w-6 h-6 text-fuchsia-500" />
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {myFeedback.length > 0 ? myFeedback.map((fb) => (
                <div key={fb.id} className="p-5 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:-translate-y-1 transition-transform cursor-default flex flex-col">
                  <div className="flex items-center space-x-1 mb-3">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400"/><Star className="w-4 h-4 text-amber-400 fill-amber-400"/><Star className="w-4 h-4 text-amber-400 fill-amber-400"/><Star className="w-4 h-4 text-amber-400 fill-amber-400"/><Star className="w-4 h-4 text-amber-400 fill-amber-400"/>
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
          
          {/* Pending Requests Widget */}
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8 text-left relative overflow-hidden">
            <div className="absolute top-0 right-0 w-full h-1.5 bg-gradient-to-r from-fuchsia-500 to-rose-500"></div>
            <h3 className="text-xl font-black text-gray-900 mb-2 flex items-center justify-between">
              Requests 
              {totalRequests > 0 && <span className="bg-rose-100 text-rose-600 px-3 py-1 rounded-xl text-sm animate-pulse">{totalRequests} New</span>}
            </h3>
            <p className="text-sm text-gray-500 font-semibold mb-6">Juniors requesting to join.</p>
            
            <div className="space-y-4 max-h-[250px] overflow-y-auto no-scrollbar pr-2">
              {totalRequests > 0 ? (
                allPendingRequests.map(({ student, group }) => (
                  <div key={`${group._id}-${student._id}`} className="flex items-center p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:border-fuchsia-200 transition-colors group/req">
                    <div className="w-10 h-10 rounded-xl mr-3 bg-indigo-100 text-indigo-600 flex items-center justify-center font-black border border-indigo-200 shadow-sm shrink-0 overflow-hidden">
                      {student.avatar ? <img src={student.avatar} alt="avatar" className="w-full h-full object-cover" /> : (student.name ? student.name.charAt(0).toUpperCase() : 'S')}
                    </div>
                    <div className="flex-1 overflow-hidden pr-2">
                      <h4 className="font-black text-gray-900 text-sm group-hover/req:text-fuchsia-600 transition-colors truncate">{student.name}</h4>
                      <p className="text-[10px] text-gray-500 font-bold mt-0.5 truncate">
                        Req: <span className="text-fuchsia-600">{group.module_name}</span>
                      </p>
                    </div>
                    <div className="flex space-x-1 shrink-0">
                      <button onClick={() => handleApproveRequest(group._id, student._id)} className="p-1.5 rounded-lg bg-emerald-100 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-colors" title="Approve">
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleRejectRequest(group._id, student._id)} className="p-1.5 rounded-lg bg-rose-100 text-rose-600 hover:bg-rose-500 hover:text-white transition-colors" title="Reject">
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
                  <button onClick={() => deleteTask(task.id)} className="p-2 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )) : (
                <p className="text-center text-gray-400 text-sm font-bold py-4">No tasks added yet.</p>
              )}
            </div>
          </div>

          {/* AI INSIGHTS WIDGET */}
          <div className="bg-gradient-to-br from-indigo-50 to-fuchsia-50 rounded-[2.5rem] border border-indigo-100 p-8 text-left relative overflow-hidden group cursor-default">
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-fuchsia-400 rounded-full filter blur-[50px] opacity-20 group-hover:opacity-40 transition-opacity"></div>
            <div className="relative z-10">
              <div className="flex items-center space-x-2 mb-4">
                <Lightbulb className="w-5 h-5 text-amber-500 animate-pulse" />
                <h3 className="text-xs font-black text-indigo-800 uppercase tracking-widest">Kuppi AI Insights</h3>
              </div>
              <p className="text-gray-800 text-sm font-bold leading-relaxed mb-4">"Adding a Quiz to your sessions increases student engagement by <span className="text-fuchsia-600 font-black">40%</span>. Try adding one to your recent class!"</p>
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
    <div className="animate-in slide-in-from-right-8 duration-500 text-left space-y-8 max-w-5xl mx-auto">
      <div className="bg-gradient-to-r from-[#0f172a] to-indigo-900 rounded-[3rem] p-10 text-white shadow-xl relative overflow-hidden flex items-center">
         <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full mix-blend-overlay filter blur-[40px]"></div>
         <div className="w-24 h-24 bg-white/10 rounded-[2rem] flex items-center justify-center mr-8 border border-white/20 backdrop-blur-md">
            <Inbox className="w-12 h-12 text-indigo-300" />
         </div>
         <div className="relative z-10">
            <h3 className="text-4xl font-black mb-2">Student Messages</h3>
            <p className="text-indigo-200 font-medium text-lg">Answer questions and guide your juniors.</p>
         </div>
      </div>

      <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 p-8 min-h-[500px]">
        {myInbox.length > 0 ? (
          <div className="space-y-8">
            {myInbox.map(msg => {
              const thread = getThread(msg);
              const unread = !msg.readBySenior && msg.reply === null;
              return (
              <div key={msg.id} className={`p-6 rounded-[2rem] border-2 transition-all ${unread ? 'border-fuchsia-300 bg-fuchsia-50/30' : 'border-gray-50 bg-white shadow-sm'}`}>
                
                {/* Header Info */}
                <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                  <div className="flex items-center">
                    <span className="px-3 py-1 bg-fuchsia-50 text-fuchsia-600 text-[10px] font-black uppercase tracking-widest rounded-lg border border-fuchsia-100 mr-4">
                      {msg.type}
                    </span>
                    <p className="text-xs font-bold text-gray-400">Message from <span className="text-gray-800 font-black">{msg.senderName}</span></p>
                  </div>
                  <div className="flex items-center space-x-3">
                     {unread && (
                        <button onClick={() => markAsRead(msg.id)} className="px-3 py-1.5 bg-fuchsia-600 text-white rounded-lg shadow-md hover:bg-fuchsia-700 transition-colors flex items-center text-[10px] font-black uppercase tracking-widest">
                          <CheckCheck className="w-3 h-3 mr-1"/> Mark Read
                        </button>
                     )}
                     <button onClick={() => handleDeleteMessage(msg.id)} className="p-2 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors" title="Delete Conversation">
                        <Trash2 className="w-4 h-4" />
                     </button>
                     <span className="text-xs font-bold text-gray-400">{new Date(msg.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar flex flex-col">
                  
                  {/* Junior's Initial Message (Left Aligned) */}
                  <div className="flex flex-col items-start">
                     <div className="flex items-center mb-1 ml-1">
                        <div className="w-6 h-6 bg-fuchsia-100 text-fuchsia-600 rounded-full flex items-center justify-center text-[10px] font-black mr-2 border border-fuchsia-200 overflow-hidden">
                           {msg.senderAvatar ? <img src={msg.senderAvatar} alt="avatar" className="w-full h-full object-cover" /> : msg.senderName.charAt(0)}
                        </div>
                        <p className="text-[10px] font-bold text-gray-500">{msg.senderName} <span className="ml-2 text-fuchsia-400">{msg.timestamp && !isNaN(new Date(msg.timestamp).getTime()) ? new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}</span></p>
                     </div>
                     <div className="bg-gray-100 text-gray-800 p-4 rounded-2xl rounded-tl-none max-w-[85%] sm:max-w-[70%] border border-gray-200 shadow-sm">
                        <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                     </div>
                  </div>
                  
                  {/* Dynamic Thread Rendering */}
                  {thread.map((reply, i) => {
                    const isMe = reply.senderId === user._id;
                    if(isMe) {
                      // SENIOR REPLY IN THREAD (Right Aligned) WITH CRUD
                      return (
                        <div key={reply.id || i} className="flex flex-col items-end group/reply w-full animate-in fade-in slide-in-from-right-4">
                           {editingReplyId === (reply.id || msg.id) ? (
                             // 🔴 Premium Edit Reply UI
                             <div className="bg-white border-2 border-indigo-300 p-5 rounded-[2.5rem] shadow-[0_10px_40px_rgba(79,70,229,0.15)] w-full max-w-[95%] sm:max-w-[85%] animate-in slide-in-from-bottom-4 focus-within:border-indigo-500 focus-within:shadow-[0_10px_40px_rgba(79,70,229,0.25)] transition-all relative">
                               <div className="flex items-center mb-4">
                                 <Edit3 className="w-4 h-4 text-indigo-500 mr-2" />
                                 <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">Editing Reply</span>
                               </div>
                               <textarea 
                                 className="w-full bg-gray-50 border-2 border-gray-100 rounded-3xl p-5 text-sm font-bold text-gray-900 focus:outline-none focus:bg-white focus:border-indigo-300 mb-4 resize-none transition-all placeholder-gray-400 shadow-inner custom-scrollbar"
                                 value={editReplyText}
                                 onChange={(e) => setEditReplyText(e.target.value)}
                                 rows="4"
                                 autoFocus
                               />
                               <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                                 <div className="flex items-center bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-100 w-fit">
                                    <Activity className={`w-4 h-4 mr-2 ${editReplyText.length > 500 ? 'text-rose-500 animate-pulse' : 'text-indigo-400'}`} />
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${editReplyText.length > 500 ? 'text-rose-500' : 'text-gray-500'}`}>
                                      {editReplyText.length} / 500 Characters
                                    </span>
                                 </div>
                                 <div className="flex space-x-3 w-full sm:w-auto">
                                   <button onClick={() => {setEditingReplyId(null); setEditReplyText('');}} className="flex-1 sm:flex-none px-6 py-3.5 text-xs font-black text-gray-500 bg-gray-100 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 border border-transparent rounded-2xl transition-all shadow-sm">Cancel</button>
                                   <button onClick={() => {
                                     if (reply.id === 'legacy') handleUpdateReply(msg.id);
                                     else handleEditThreadReply(msg.id, reply.id, editReplyText);
                                   }} disabled={!editReplyText.trim() || editReplyText.length > 500} className="flex-1 sm:flex-none px-8 py-3.5 text-xs font-black text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 rounded-2xl shadow-xl shadow-indigo-500/30 transition-all flex items-center justify-center hover:-translate-y-1 group/send disabled:opacity-50 disabled:hover:translate-y-0"><Save className="w-4 h-4 mr-2 group-hover/send:scale-110 transition-transform"/> Update Reply</button>
                                 </div>
                               </div>
                             </div>
                           ) : (
                             // NORMAL UI
                             <>
                               <div className="flex items-center mb-1 mr-1">
                                  {/* CRUD Actions */}
                                  <div className="flex items-center space-x-1 mr-3 opacity-0 group-hover/reply:opacity-100 transition-opacity">
                                    <button onClick={() => {setEditingReplyId(reply.id || msg.id); setEditReplyText(reply.text);}} className="p-1.5 bg-indigo-50 text-indigo-500 hover:bg-indigo-500 hover:text-white rounded-lg transition-all shadow-sm" title="Edit Reply"><Edit3 className="w-3.5 h-3.5" /></button>
                                    <button onClick={() => {
                                      if (reply.id === 'legacy') handleDeleteReply(msg.id);
                                      else handleDeleteThreadReply(msg.id, reply.id);
                                    }} className="p-1.5 bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg transition-all shadow-sm" title="Delete Reply"><Trash2 className="w-3.5 h-3.5" /></button>
                                  </div>
                                  <p className="text-[10px] font-bold text-gray-400">You <span className="ml-2 text-indigo-400">{reply.timestamp ? new Date(reply.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Just now'}</span></p>
                               </div>
                               <div className="bg-gradient-to-br from-indigo-600 to-blue-600 text-white p-4 rounded-2xl rounded-tr-none max-w-[85%] sm:max-w-[70%] shadow-[0_4px_15px_rgba(79,70,229,0.3)] text-left relative">
                                  <p className="text-sm font-medium leading-relaxed">{reply.text}</p>
                               </div>
                             </>
                           )}
                        </div>
                      );
                    } else {
                      // JUNIOR REPLY IN THREAD (Left Aligned)
                      return (
                        <div key={reply.id || i} className="flex flex-col items-start animate-in fade-in slide-in-from-left-4">
                           <div className="flex items-center mb-1 ml-1">
                              <div className="w-6 h-6 bg-fuchsia-100 text-fuchsia-600 rounded-full flex items-center justify-center text-[10px] font-black mr-2 border border-fuchsia-200 overflow-hidden">
                                 {reply.senderName?.charAt(0) || msg.senderName.charAt(0)}
                              </div>
                              <p className="text-[10px] font-bold text-gray-500">{reply.senderName || msg.senderName} <span className="ml-2 text-fuchsia-400">{new Date(reply.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span></p>
                           </div>
                           <div className="bg-gray-100 text-gray-800 p-4 rounded-2xl rounded-tl-none max-w-[85%] sm:max-w-[70%] border border-gray-200 shadow-sm">
                              <p className="text-sm font-medium leading-relaxed">{reply.text}</p>
                           </div>
                        </div>
                      );
                    }
                  })}

                  {/* 🔴 CONTINUOUS CHAT REPLY EDITOR FOR SENIOR */}
                  <div className="flex flex-col items-end w-full mt-4 pt-4 border-t border-gray-100">
                    {replyingTo === msg.id ? (
                      <div className="bg-white border-2 border-fuchsia-300 p-6 rounded-[2.5rem] rounded-tr-xl shadow-[0_20px_60px_rgba(217,70,239,0.15)] w-full max-w-[95%] sm:max-w-[85%] animate-in slide-in-from-bottom-4 focus-within:border-fuchsia-500 focus-within:shadow-[0_20px_60px_rgba(217,70,239,0.3)] transition-all duration-500 relative">
                        
                        <div className="absolute -top-4 -right-4 bg-gradient-to-br from-fuchsia-500 to-indigo-600 p-3 rounded-2xl shadow-lg shadow-fuchsia-500/40 animate-bounce">
                          <MessageSquare className="w-5 h-5 text-white" />
                        </div>
                        
                        <div className="flex items-center mb-4">
                          <CornerDownRight className="w-5 h-5 text-fuchsia-500 mr-2" />
                          <span className="text-xs font-black text-fuchsia-600 uppercase tracking-widest">Drafting Reply to {msg.senderName.split(' ')[0]}</span>
                        </div>

                        <div className="relative group/editor">
                          <textarea 
                            className="w-full bg-gray-50/50 border-2 border-gray-100 rounded-3xl p-5 text-sm font-bold text-gray-900 focus:outline-none focus:bg-white focus:border-fuchsia-300 mb-4 resize-none transition-all placeholder-gray-400 shadow-inner custom-scrollbar"
                            placeholder="Type your expert advice here..."
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            rows="4"
                            autoFocus
                          />
                        </div>

                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                          <div className="flex items-center bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-100 w-fit">
                            <Activity className={`w-4 h-4 mr-2 ${replyText.length > 500 ? 'text-rose-500 animate-pulse' : 'text-fuchsia-400'}`} />
                            <span className={`text-[10px] font-black uppercase tracking-widest ${replyText.length > 500 ? 'text-rose-500' : 'text-gray-500'}`}>
                              {replyText.length} / 500 Characters
                            </span>
                          </div>
                          
                          <div className="flex space-x-3 w-full sm:w-auto">
                            <button onClick={() => {setReplyingTo(null); setReplyText('');}} className="flex-1 sm:flex-none px-6 py-3.5 text-xs font-black text-gray-500 bg-gray-100 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 border border-transparent rounded-2xl transition-all shadow-sm">
                              Cancel
                            </button>
                            <button onClick={() => handleThreadReply(msg.id)} 
                              disabled={!replyText.trim() || replyText.length > 500} className="flex-1 sm:flex-none px-8 py-3.5 text-xs font-black text-white bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 rounded-2xl shadow-xl shadow-fuchsia-500/30 transition-all flex items-center justify-center hover:-translate-y-1 group/send disabled:opacity-50 disabled:hover:translate-y-0">
                              Send Reply <Send className="w-4 h-4 ml-2 group-hover/send:translate-x-1 group-hover/send:-translate-y-1 transition-transform" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => {setReplyingTo(msg.id); setReplyText('');}} className="px-6 py-3.5 bg-fuchsia-50 hover:bg-fuchsia-600 text-fuchsia-600 hover:text-white font-black rounded-2xl transition-all shadow-sm flex items-center border border-fuchsia-100 group">
                        <CornerDownRight className="w-4 h-4 mr-2 group-hover:translate-x-1 group-hover:translate-y-1 transition-transform" /> Reply to Thread
                      </button>
                    )}
                  </div>

                </div>
              </div>
            );
            })}
          </div>
        ) : (
          <div className="text-center py-24 flex flex-col items-center">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 shadow-inner border border-gray-100">
               <MessageSquare className="w-10 h-10 text-indigo-300" />
            </div>
            <h3 className="text-3xl font-black text-gray-900 mb-2">Your inbox is empty</h3>
            <p className="text-gray-500 font-medium mb-8 max-w-sm">When students ask questions or send feedback, they will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );

  // ---------------------------------------------------------
  // 🟢 TAB 2: MY SESSIONS UI 
  // ---------------------------------------------------------
  const renderSessions = () => (
    <div className="animate-in slide-in-from-bottom-4 duration-500 text-left space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 mb-8">
        <div>
          <h3 className="text-4xl font-black text-gray-900">My Masterclasses</h3>
          <p className="text-gray-500 font-bold text-lg">Manage all your hosted content and students.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search classes..." 
              value={sessionSearch}
              onChange={(e) => setSessionSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-fuchsia-600 font-bold text-sm shadow-sm" 
            />
          </div>
          <button onClick={() => setIsModalOpen(true)} className="flex items-center px-6 py-3 bg-fuchsia-600 hover:bg-fuchsia-700 text-white rounded-xl font-black transition-all shadow-lg w-full sm:w-auto justify-center">
            <Plus className="w-5 h-5 mr-2" /> New Class
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filteredSessions.map((group, index) => {
          const fillPercentage = (group.current_members.length / group.max_members) * 100;
          return (
            <div key={group._id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 hover:border-fuchsia-200 transition-all duration-300 relative text-left flex flex-col group/card hover:shadow-xl">
              
              <div className="absolute top-6 right-6 flex space-x-2">
                <button onClick={() => openEditModal(group)} className="p-2.5 bg-indigo-50 text-indigo-500 hover:bg-indigo-500 hover:text-white rounded-xl transition-all shadow-sm border border-indigo-100" title="Edit"><Edit3 className="w-4 h-4" /></button>
                <button onClick={() => handleDeleteSession(group._id, group.module_name)} className="p-2.5 bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl transition-all shadow-sm border border-rose-100" title="Delete"><Trash2 className="w-4 h-4" /></button>
              </div>

              <div className="flex items-center mb-6">
                <div className="p-4 bg-fuchsia-50 text-fuchsia-600 rounded-2xl mr-4 shadow-sm">
                  <LayoutTemplate className="w-8 h-8" />
                </div>
                <div>
                  <span className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-xl border border-indigo-100 uppercase tracking-widest">{group.semester || 'Series'}</span>
                </div>
              </div>
              
              <h4 className="font-black text-2xl text-gray-900 mb-2 leading-tight pr-16">{group.module_name}</h4>
              <p className="text-gray-500 font-semibold text-sm flex items-center mb-8"><Youtube className="w-4 h-4 mr-2 text-rose-500" /> Recorded Material</p>
              
              <div className="mb-6 mt-auto">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-xs font-black text-gray-500 uppercase tracking-wider">Capacity</span>
                  <span className="text-sm font-black text-fuchsia-600">{group.current_members.length} / {group.max_members}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden mb-6">
                  <div className={`h-full rounded-full transition-all duration-1000 ${fillPercentage >= 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-fuchsia-500 to-indigo-500'}`} style={{ width: `${fillPercentage}%` }}></div>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button onClick={() => copyToClipboard(group.session_link)} className="p-4 bg-gray-50 text-gray-500 hover:bg-fuchsia-600 hover:text-white rounded-2xl transition-colors border border-gray-200 hover:border-fuchsia-600" title="Copy Invitation Link">
                  <Share2 className="w-5 h-5" />
                </button>
                <button onClick={() => handleManageStudents(group)} className="flex-1 py-4 bg-fuchsia-50 hover:bg-fuchsia-600 text-fuchsia-700 hover:text-white font-black rounded-2xl transition-all border border-fuchsia-100 hover:border-fuchsia-600 flex justify-center items-center shadow-sm group/btn2">
                  Manage Students <ChevronRight className="w-5 h-5 ml-2 group-hover/btn2:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          );
        })}
        {filteredSessions.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-gray-200">
            <LayoutTemplate className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-bold text-xl">No masterclasses found.</p>
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
      <div className="animate-in slide-in-from-right-8 duration-500 text-left space-y-12 max-w-5xl mx-auto">
        <div className="text-center space-y-4">
          <div className="w-24 h-24 bg-gradient-to-br from-amber-300 to-orange-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-orange-500/30">
            <Award className="text-white w-12 h-12" />
          </div>
          <h3 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tight">Mentor Rankings</h3>
          <p className="text-gray-500 font-medium text-xl">The top experts shaping the Kuppi Space network.</p>
        </div>
        
        {/* 🔴 NEW PODIUM UI (MATCHING JUNIOR DASHBOARD) */}
        <div className="flex flex-row justify-center items-end gap-4 md:gap-8 pt-12 pb-12">
          
          {/* 2nd Place (Left) */}
          {globalRankedMentors[1] && (
            <div className="flex flex-col items-center order-2 md:order-1 relative z-10 group mx-2 sm:mx-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-200 rounded-[1.2rem] flex items-center justify-center text-slate-600 font-black text-3xl sm:text-4xl relative z-20 shadow-md overflow-hidden border-4 border-white transition-transform duration-300 group-hover:scale-110">
                {globalRankedMentors[1].avatar ? <img src={globalRankedMentors[1].avatar} alt="avatar" className="w-full h-full object-cover" /> : globalRankedMentors[1].initial}
              </div>
              <div className="w-28 sm:w-32 h-28 sm:h-32 bg-gradient-to-t from-slate-200 to-slate-50 rounded-t-[1.5rem] border-x border-t border-slate-300 flex flex-col items-center justify-center pt-8 sm:pt-10 mt-[-2rem] sm:mt-[-2.5rem] relative z-10 shadow-inner group-hover:-translate-y-2 transition-transform duration-300">
                <span className="text-2xl sm:text-3xl mb-1">🥈</span>
                <span className="font-black text-slate-700 text-xs sm:text-sm">{globalRankedMentors[1].xp} XP</span>
              </div>
              <div className="mt-4 flex flex-col items-center">
                <p className="font-black text-gray-900 text-base sm:text-lg text-center">{globalRankedMentors[1].name.split(' ')[0]}</p>
                {globalRankedMentors[1].isMe && <span className="bg-fuchsia-600 text-white text-[9px] px-2 py-0.5 rounded-md uppercase tracking-widest mt-1 shadow-sm">You</span>}
              </div>
            </div>
          )}
          
          {/* 1st Place (Center) */}
          {globalRankedMentors[0] && (
            <div className="flex flex-col items-center order-1 md:order-2 relative z-20 group mx-2 sm:mx-4">
              <div className="absolute -top-10 text-4xl sm:text-5xl animate-bounce">👑</div>
              <div className="w-24 h-24 sm:w-28 sm:h-28 bg-amber-400 rounded-[1.5rem] flex items-center justify-center text-amber-800 font-black text-4xl sm:text-5xl relative z-20 shadow-xl overflow-hidden border-4 border-white transition-transform duration-300 group-hover:scale-110">
                {globalRankedMentors[0].avatar ? <img src={globalRankedMentors[0].avatar} alt="avatar" className="w-full h-full object-cover" /> : globalRankedMentors[0].initial}
              </div>
              <div className="w-32 sm:w-40 h-36 sm:h-44 bg-gradient-to-t from-amber-300 to-amber-50 rounded-t-[2rem] border-x border-t border-amber-400 flex flex-col items-center justify-center pt-10 sm:pt-12 mt-[-2.5rem] sm:mt-[-3rem] relative z-10 shadow-[0_-10px_20px_rgba(251,191,36,0.2)] group-hover:-translate-y-2 transition-transform duration-300">
                <span className="text-3xl sm:text-4xl mb-1">🥇</span>
                <span className="font-black text-amber-900 text-sm sm:text-lg">{globalRankedMentors[0].xp} XP</span>
              </div>
              <div className="mt-4 flex flex-col items-center">
                <p className="font-black text-gray-900 text-lg sm:text-xl text-center">{globalRankedMentors[0].name.split(' ')[0]}</p>
                {globalRankedMentors[0].isMe && <span className="bg-fuchsia-600 text-white text-[9px] px-2 py-0.5 rounded-md uppercase tracking-widest mt-1 shadow-sm">You</span>}
              </div>
            </div>
          )}

          {/* 3rd Place (Right) */}
          {globalRankedMentors[2] && (
            <div className="flex flex-col items-center order-3 relative z-10 group mx-2 sm:mx-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-orange-200 rounded-[1.2rem] flex items-center justify-center text-orange-700 font-black text-3xl sm:text-4xl relative z-20 shadow-md overflow-hidden border-4 border-white transition-transform duration-300 group-hover:scale-110">
                {globalRankedMentors[2].avatar ? <img src={globalRankedMentors[2].avatar} alt="avatar" className="w-full h-full object-cover" /> : globalRankedMentors[2].initial}
              </div>
              <div className="w-28 sm:w-32 h-24 sm:h-28 bg-gradient-to-t from-orange-200 to-orange-50 rounded-t-[1.5rem] border-x border-t border-orange-300 flex flex-col items-center justify-center pt-8 sm:pt-10 mt-[-2rem] sm:mt-[-2.5rem] relative z-10 shadow-inner group-hover:-translate-y-2 transition-transform duration-300">
                <span className="text-2xl sm:text-3xl mb-1">🥉</span>
                <span className="font-black text-orange-800 text-xs sm:text-sm">{globalRankedMentors[2].xp} XP</span>
              </div>
              <div className="mt-4 flex flex-col items-center">
                <p className="font-black text-gray-900 text-base sm:text-lg text-center">{globalRankedMentors[2].name.split(' ')[0]}</p>
                {globalRankedMentors[2].isMe && <span className="bg-fuchsia-600 text-white text-[9px] px-2 py-0.5 rounded-md uppercase tracking-widest mt-1 shadow-sm">You</span>}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-[3rem] shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-8 bg-[#0f172a] text-white flex justify-between items-center">
            <span className="font-black uppercase tracking-widest text-sm flex items-center"><Users className="w-5 h-5 mr-3 text-fuchsia-400"/> Network Leaderboard</span>
            <span className="bg-white/10 border border-white/20 px-4 py-2 rounded-xl text-xs font-bold backdrop-blur-sm">Season 2026</span>
          </div>
          <div className="p-4 space-y-3 bg-gray-50/50">
            {globalRankedMentors.map((mentor, index) => {
              const rank = index + 1;
              return (
              <div key={mentor.id} className={`flex items-center p-5 rounded-3xl transition-all group cursor-default border ${mentor.isMe ? 'bg-fuchsia-50 border-fuchsia-200 shadow-md scale-[1.01]' : 'bg-white border-gray-100 hover:shadow-md hover:border-fuchsia-100'}`}>
                <div className="w-14 h-14 flex items-center justify-center font-black text-xl mr-6">
                   {rank === 1 ? <span className="text-3xl">🥇</span> : 
                    rank === 2 ? <span className="text-3xl">🥈</span> : 
                    rank === 3 ? <span className="text-3xl">🥉</span> : 
                    <span className="text-gray-400 bg-gray-100 w-10 h-10 rounded-xl flex items-center justify-center">{rank}</span>}
                </div>
                <div className={`w-14 h-14 rounded-[1.2rem] flex items-center justify-center font-black text-xl mr-6 transition-colors overflow-hidden ${mentor.isMe ? 'bg-fuchsia-600 text-white shadow-lg' : 'bg-indigo-50 text-indigo-600 border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white'}`}>
                  {mentor.avatar ? <img src={mentor.avatar} alt="avatar" className="w-full h-full object-cover" /> : mentor.initial}
                </div>
                <div className="flex-1">
                  <p className="font-black text-xl text-gray-900 leading-tight mb-1 flex items-center">
                    {mentor.name} {mentor.isMe && <span className="ml-3 bg-fuchsia-600 text-white text-[10px] px-2 py-1 rounded-md uppercase tracking-widest shadow-sm">You</span>}
                  </p>
                  <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest">{mentor.level}</p>
                </div>
                <div className="text-right pr-4">
                  <p className={`font-black text-3xl transition-colors ${mentor.isMe ? 'text-fuchsia-600' : 'text-gray-900 group-hover:text-indigo-600'}`}>{mentor.xp}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">XP Points</p>
                </div>
              </div>
            )})}
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
    <div className="animate-in slide-in-from-right-8 duration-500 text-left space-y-8 max-w-5xl mx-auto">
      
      <div className="bg-gradient-to-r from-[#0f172a] to-fuchsia-900 rounded-[3rem] p-10 text-white shadow-xl relative overflow-hidden flex items-center">
         <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full mix-blend-overlay filter blur-[40px]"></div>
         <div className="w-24 h-24 bg-white/10 rounded-[2rem] flex items-center justify-center mr-8 border border-white/20 backdrop-blur-md">
            <Settings className="w-12 h-12 text-fuchsia-300" />
         </div>
         <div className="relative z-10">
            <h3 className="text-4xl font-black mb-2">Account Settings</h3>
            <p className="text-fuchsia-200 font-medium text-lg">Manage your expert profile and platform preferences.</p>
         </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        <div className="w-full lg:w-72 space-y-3">
          <button onClick={() => setSettingsTab('profile')} className={`w-full flex items-center px-6 py-5 rounded-[1.5rem] font-black transition-all ${settingsTab === 'profile' ? 'bg-fuchsia-800 text-white shadow-lg shadow-fuchsia-900/30 translate-x-2' : 'bg-white text-gray-500 hover:bg-fuchsia-50 border border-gray-100'}`}>
             <User className="w-5 h-5 mr-4" /> Expert Profile
          </button>
          <button onClick={() => setSettingsTab('security')} className={`w-full flex items-center px-6 py-5 rounded-[1.5rem] font-black transition-all ${settingsTab === 'security' ? 'bg-fuchsia-800 text-white shadow-lg shadow-fuchsia-900/30 translate-x-2' : 'bg-white text-gray-500 hover:bg-fuchsia-50 border border-gray-100'}`}>
             <Key className="w-5 h-5 mr-4" /> Security
          </button>
          <button onClick={() => setSettingsTab('notifications')} className={`w-full flex items-center px-6 py-5 rounded-[1.5rem] font-black transition-all ${settingsTab === 'notifications' ? 'bg-fuchsia-800 text-white shadow-lg shadow-fuchsia-900/30 translate-x-2' : 'bg-white text-gray-500 hover:bg-fuchsia-50 border border-gray-100'}`}>
             <BellRing className="w-5 h-5 mr-4" /> Notifications
          </button>
        </div>

        <div className="flex-1 bg-white rounded-[3rem] shadow-sm border border-gray-100 p-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-fuchsia-50 rounded-bl-full -z-10 opacity-50"></div>

          {settingsTab === 'profile' && (
            <div className="animate-in fade-in duration-500">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 mb-10">
                <div className="relative group">
                  <div className="w-36 h-36 rounded-[2.5rem] bg-gradient-to-tr from-fuchsia-600 to-indigo-500 flex items-center justify-center text-white text-5xl font-black shadow-xl group-hover:scale-105 transition-transform overflow-hidden border-4 border-white">
                     {user?.avatar ? (
                        <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                     ) : (
                        user?.name ? user.name.charAt(0).toUpperCase() : 'M'
                     )}
                  </div>
                  <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} className="hidden" accept="image/*" />
                  <button onClick={() => fileInputRef.current.click()} className="absolute -bottom-3 -right-3 p-3 bg-white text-fuchsia-600 rounded-2xl shadow-lg border border-gray-100 hover:bg-fuchsia-50 hover:scale-110 transition-all">
                    <Camera className="w-5 h-5" />
                  </button>
                </div>
                <div className="text-center sm:text-left mt-4 sm:mt-0">
                  <h4 className="text-3xl font-black text-gray-900">{user?.name || 'Senior Mentor'}</h4>
                  <p className="text-gray-500 font-bold mb-4 text-lg">{user?.email}</p>
                  <span className="px-5 py-2 bg-indigo-50 text-indigo-600 text-xs font-black uppercase tracking-widest rounded-xl border border-indigo-100">Verified Expert</span>
                </div>
              </div>
              
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input type="text" value={profileData.name} onChange={(e) => setProfileData({...profileData, name: e.target.value})} className="w-full pl-14 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-bold text-gray-900 focus:bg-white focus:border-fuchsia-400 outline-none transition-all" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input type="email" defaultValue={user?.email || ''} readOnly className="w-full pl-14 pr-4 py-4 bg-gray-100 border-2 border-transparent text-gray-400 rounded-2xl font-bold outline-none cursor-not-allowed" />
                    </div>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Expertise Headline</label>
                    <div className="relative">
                      <Briefcase className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input type="text" value={profileData.headline} onChange={(e) => setProfileData({...profileData, headline: e.target.value})} placeholder="e.g. Senior Cloud Architect, React Specialist" className="w-full pl-14 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-bold text-gray-900 focus:bg-white focus:border-fuchsia-400 outline-none transition-all" />
                    </div>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">About My Mentorship</label>
                    <textarea rows="4" value={profileData.bio} onChange={(e) => setProfileData({...profileData, bio: e.target.value})} placeholder="Describe what you teach and how you help students..." className="w-full p-5 bg-gray-50 border-2 border-gray-100 rounded-2xl font-bold text-gray-900 focus:bg-white focus:border-fuchsia-400 outline-none transition-all resize-none"></textarea>
                  </div>
                </div>
                <div className="pt-4 flex justify-end">
                  <button type="submit" disabled={isSavingProfile} className="px-8 py-4 bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-black rounded-2xl shadow-lg shadow-fuchsia-500/30 transition-all flex items-center hover:-translate-y-1 disabled:opacity-70">
                    {isSavingProfile ? 'Saving...' : 'Save Profile'} <Save className="w-5 h-5 ml-2" />
                  </button>
                </div>
              </form>
            </div>
          )}

          {settingsTab === 'security' && (
            <div className="animate-in fade-in duration-500 space-y-8">
              <div>
                <h4 className="text-2xl font-black text-gray-900 mb-1">Update Password</h4>
                <p className="text-gray-500 font-medium text-sm">Ensure your account is using a long, random password to stay secure.</p>
              </div>
              <form onSubmit={(e) => {e.preventDefault(); alert("Password changed successfully!");}} className="space-y-6 max-w-lg">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Current Password</label>
                  <div className="relative">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input required type="password" placeholder="••••••••" className="w-full pl-14 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-bold text-gray-900 focus:bg-white focus:border-fuchsia-400 outline-none transition-all" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">New Password</label>
                  <div className="relative">
                    <Key className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input required type="password" placeholder="••••••••" className="w-full pl-14 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-bold text-gray-900 focus:bg-white focus:border-fuchsia-400 outline-none transition-all" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Confirm New Password</label>
                  <div className="relative">
                    <CheckCircle className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input required type="password" placeholder="••••••••" className="w-full pl-14 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-bold text-gray-900 focus:bg-white focus:border-fuchsia-400 outline-none transition-all" />
                  </div>
                </div>
                <button type="submit" className="w-full py-4 bg-gray-900 hover:bg-black text-white font-black rounded-2xl shadow-lg transition-all flex items-center justify-center">
                  Update Password
                </button>
              </form>
            </div>
          )}

          {settingsTab === 'notifications' && (
            <div className="animate-in fade-in duration-500 space-y-8">
              <div>
                <h4 className="text-2xl font-black text-gray-900 mb-1">Preferences</h4>
                <p className="text-gray-500 font-medium text-sm">Choose what updates you want to receive.</p>
              </div>
              <div className="space-y-4">
                
                <div onClick={() => setProfilePublic(!profilePublic)} className={`flex items-center justify-between p-5 bg-gray-50 border rounded-2xl cursor-pointer transition-colors ${profilePublic ? 'border-fuchsia-200 shadow-sm' : 'border-gray-100'}`}>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm mr-4"><Globe className={`w-6 h-6 ${profilePublic ? 'text-emerald-500' : 'text-gray-400'}`}/></div>
                    <div>
                      <p className="font-black text-gray-900">Public Profile</p>
                      <p className="text-xs font-bold text-gray-500 mt-0.5">Allow students to find you in Search.</p>
                    </div>
                  </div>
                  <div className={`w-14 h-7 rounded-full relative shadow-inner transition-colors ${profilePublic ? 'bg-emerald-500' : 'bg-gray-300'}`}>
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-1 shadow-sm transition-all ${profilePublic ? 'right-1' : 'left-1'}`}></div>
                  </div>
                </div>

                <div onClick={() => setEmailNotif(!emailNotif)} className={`flex items-center justify-between p-5 bg-gray-50 border rounded-2xl cursor-pointer transition-colors ${emailNotif ? 'border-fuchsia-200 shadow-sm' : 'border-gray-100'}`}>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm mr-4"><Mail className={`w-6 h-6 ${emailNotif ? 'text-fuchsia-500' : 'text-gray-400'}`}/></div>
                    <div>
                      <p className="font-black text-gray-900">Email Alerts</p>
                      <p className="text-xs font-bold text-gray-500 mt-0.5">When students request to join.</p>
                    </div>
                  </div>
                  <div className={`w-14 h-7 rounded-full relative shadow-inner transition-colors ${emailNotif ? 'bg-fuchsia-600' : 'bg-gray-300'}`}>
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-1 shadow-sm transition-all ${emailNotif ? 'right-1' : 'left-1'}`}></div>
                  </div>
                </div>

                <div onClick={() => setPushNotif(!pushNotif)} className={`flex items-center justify-between p-5 bg-gray-50 border rounded-2xl cursor-pointer transition-colors ${pushNotif ? 'border-fuchsia-200 shadow-sm' : 'border-gray-100'}`}>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm mr-4"><Smartphone className={`w-6 h-6 ${pushNotif ? 'text-indigo-500' : 'text-gray-400'}`}/></div>
                    <div>
                      <p className="font-black text-gray-900">Push Notifications</p>
                      <p className="text-xs font-bold text-gray-500 mt-0.5">Direct device alerts for messages.</p>
                    </div>
                  </div>
                  <div className={`w-14 h-7 rounded-full relative shadow-inner transition-colors ${pushNotif ? 'bg-indigo-600' : 'bg-gray-300'}`}>
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-1 shadow-sm transition-all ${pushNotif ? 'right-1' : 'left-1'}`}></div>
                  </div>
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
          <div className="absolute inset-0 border-4 border-fuchsia-200 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-fuchsia-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <p className="mt-4 text-fuchsia-900 font-bold tracking-widest text-sm uppercase animate-pulse">Loading Workspace...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F4F7FE] flex font-sans text-gray-800 selection:bg-fuchsia-100 selection:text-fuchsia-900">
      
      {/* 🟢 PREMIUM SIDEBAR */}
      <aside className="w-64 fixed h-[calc(100vh-2rem)] my-4 ml-4 bg-white/80 backdrop-blur-xl rounded-[3rem] hidden md:flex flex-col justify-between shadow-[0_8px_30px_rgb(0,0,0,0.04)] z-20 overflow-hidden border border-white">
        <div>
          <div className="h-28 flex items-center px-8">
            <div className="w-12 h-12 bg-gradient-to-br from-fuchsia-600 to-indigo-600 rounded-2xl flex items-center justify-center mr-4 shadow-xl shadow-fuchsia-200">
              <Zap className="w-7 h-7 text-white fill-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight leading-none">Kuppi</h1>
              <h1 className="text-xl font-bold text-fuchsia-600 tracking-wide leading-none">Mentor.</h1>
            </div>
          </div>
          <nav className="p-5 space-y-3 text-left">
            <button onClick={() => setActiveTab('dashboard')} className={`flex items-center w-full px-5 py-4 rounded-2xl font-bold transition-all ${activeTab === 'dashboard' ? 'bg-fuchsia-800 text-white shadow-lg shadow-fuchsia-900/30' : 'text-gray-500 hover:bg-fuchsia-50 hover:text-fuchsia-600'}`}>
              <LayoutDashboard className="w-5 h-5 mr-3" /> Dashboard
            </button>
            <button onClick={() => setActiveTab('sessions')} className={`flex items-center w-full px-5 py-4 rounded-2xl font-bold transition-all ${activeTab === 'sessions' ? 'bg-fuchsia-800 text-white shadow-lg shadow-fuchsia-900/30' : 'text-gray-500 hover:bg-fuchsia-50 hover:text-fuchsia-600'}`}>
              <BookOpen className="w-5 h-5 mr-3" /> My Sessions
            </button>
            <button onClick={() => setActiveTab('leaderboard')} className={`flex items-center w-full px-5 py-4 rounded-2xl font-bold transition-all ${activeTab === 'leaderboard' ? 'bg-fuchsia-800 text-white shadow-lg shadow-fuchsia-900/30' : 'text-gray-500 hover:bg-fuchsia-50 hover:text-fuchsia-600'}`}>
              <Award className="w-5 h-5 mr-3" /> Rankings
            </button>
            {/* 🔴 NEW: INBOX TAB FOR SENIOR */}
            <button onClick={() => setActiveTab('inbox')} className={`flex justify-between items-center w-full px-5 py-4 rounded-2xl font-bold transition-all ${activeTab === 'inbox' ? 'bg-fuchsia-800 text-white shadow-lg shadow-fuchsia-900/30' : 'text-gray-500 hover:bg-fuchsia-50 hover:text-fuchsia-600'}`}>
              <span className="flex items-center"><Inbox className="w-5 h-5 mr-3" /> Messages</span>
              {unreadMessagesCount > 0 && <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${activeTab === 'inbox' ? 'bg-white text-fuchsia-800' : 'bg-rose-500 text-white animate-pulse'}`}>{unreadMessagesCount}</span>}
            </button>
            <button onClick={() => setActiveTab('settings')} className={`flex items-center w-full px-5 py-4 rounded-2xl font-bold transition-all ${activeTab === 'settings' ? 'bg-fuchsia-800 text-white shadow-lg shadow-fuchsia-900/30' : 'text-gray-500 hover:bg-fuchsia-50 hover:text-fuchsia-600'}`}>
              <Settings className="w-5 h-5 mr-3" /> Settings
            </button>
          </nav>
        </div>
        <div className="p-5">
          <button onClick={handleLogout} className="flex items-center justify-center w-full px-5 py-4 text-gray-500 bg-gray-50 hover:bg-rose-50 hover:text-rose-600 rounded-2xl font-bold transition-all border border-transparent hover:border-rose-100">
            <LogOut className="w-5 h-5 mr-2" /> Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 md:ml-[18rem] flex flex-col min-h-screen">
        
        <header className="h-28 flex items-center justify-between px-8 sticky top-0 z-30 bg-[#F4F7FE]/90 backdrop-blur-2xl transition-all">
          <div className="relative w-[28rem] hidden sm:block group">
            <Search className="w-5 h-5 absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-fuchsia-600 transition-colors" />
            <input type="text" value={globalSearch} onChange={(e) => setGlobalSearch(e.target.value)} placeholder="Search your dashboard..." className="w-full pl-14 pr-4 py-4 bg-white border-2 border-transparent focus:border-fuchsia-200 rounded-2xl outline-none text-sm font-bold text-gray-700 shadow-sm transition-all focus:shadow-md" />
          </div>
          
          <div className="flex items-center space-x-6 ml-auto">
            <div className="relative">
              <button onClick={() => setShowNotifs(!showNotifs)} className={`relative p-4 transition-colors bg-white rounded-2xl shadow-sm border ${showNotifs ? 'text-fuchsia-600 border-fuchsia-200' : 'text-gray-400 border-gray-100 hover:border-fuchsia-100'}`}>
                <BellRing className="w-6 h-6" />
                {(totalRequests > 0 || unreadMessagesCount > 0) && <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-rose-500 rounded-full border-2 border-white animate-ping"></span>}
                {(totalRequests > 0 || unreadMessagesCount > 0) && <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-rose-500 rounded-full border-2 border-white"></span>}
              </button>
              {showNotifs && (
                <div className="absolute top-16 right-0 w-80 bg-white rounded-[2rem] shadow-2xl border border-gray-100 p-5 z-50 animate-in slide-in-from-top-4">
                   <div className="flex items-center justify-between mb-4 px-2">
                     <h4 className="font-black text-gray-900 text-lg">Alerts</h4>
                     <button onClick={() => setShowNotifs(false)} className="text-xs text-fuchsia-600 font-bold hover:underline">Close</button>
                   </div>
                   {totalRequests > 0 && (
                     <div className="p-4 bg-fuchsia-50 rounded-2xl border border-fuchsia-100 mb-3 cursor-pointer hover:bg-fuchsia-100 transition-colors">
                        <p className="text-sm font-black text-fuchsia-900 flex items-center"><Users className="w-4 h-4 mr-2"/> {totalRequests} Pending Requests</p>
                        <p className="text-xs font-bold text-fuchsia-600 mt-2 leading-relaxed">You have students waiting to join your sessions. Review them now.</p>
                     </div>
                   )}
                   {unreadMessagesCount > 0 && (
                     <div onClick={() => {setActiveTab('inbox'); setShowNotifs(false);}} className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 mb-3 cursor-pointer hover:bg-indigo-100 transition-colors">
                        <p className="text-sm font-black text-indigo-900 flex items-center"><MessageSquare className="w-4 h-4 mr-2"/> {unreadMessagesCount} Unanswered Messages!</p>
                        <p className="text-xs font-bold text-indigo-600 mt-2 leading-relaxed">Students are waiting for your reply. Check your inbox.</p>
                     </div>
                   )}
                </div>
              )}
            </div>

            <div className="relative">
              <div onClick={() => setShowProfile(!showProfile)} className={`flex items-center p-2 pr-6 bg-white rounded-[1.5rem] shadow-sm border cursor-pointer hover:shadow-md transition-all ${showProfile ? 'border-fuchsia-300' : 'border-gray-100 hover:border-fuchsia-100'}`}>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-fuchsia-600 to-indigo-500 flex items-center justify-center text-white font-black text-xl mr-4 shadow-inner overflow-hidden">
                  {user?.avatar ? <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" /> : (user?.name ? user.name.charAt(0).toUpperCase() : 'M')}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-black text-gray-900 leading-tight">{user?.name ? user.name.split(' ')[0] : 'Mentor'}</p>
                  <p className="text-[10px] text-fuchsia-600 font-bold uppercase tracking-widest mt-0.5">Senior Expert</p>
                </div>
              </div>

              {showProfile && (
                <div className="absolute top-20 right-0 w-64 bg-white rounded-[2rem] shadow-2xl border border-gray-100 p-3 z-50 animate-in slide-in-from-top-4">
                   <div className="flex items-center p-4 mb-2 bg-gray-50 rounded-2xl">
                      <div className="w-14 h-14 bg-fuchsia-100 rounded-xl text-fuchsia-600 flex items-center justify-center font-black text-2xl mr-4 overflow-hidden border border-fuchsia-200">
                        {user?.avatar ? <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" /> : (user?.name ? user.name.charAt(0).toUpperCase() : 'M')}
                      </div>
                      <div>
                        <p className="font-black text-gray-900 leading-tight text-lg truncate w-28">{user?.name ? user.name.split(' ')[0] : 'Mentor'}</p>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Verified Tier</p>
                      </div>
                   </div>
                   <div className="px-2 pb-2">
                     <button onClick={() => {setActiveTab('settings'); setShowProfile(false);}} className="w-full text-left px-4 py-3 rounded-xl text-gray-700 font-bold hover:bg-fuchsia-50 hover:text-fuchsia-600 transition-colors flex items-center text-sm">
                        <User className="w-4 h-4 mr-3" /> Mentor Profile
                     </button>
                   </div>
                   <hr className="border-gray-100 mb-2" />
                   <button onClick={handleLogout} className="w-full text-left px-5 py-4 rounded-xl text-rose-600 font-black hover:bg-rose-50 transition-colors flex items-center text-sm">
                      <LogOut className="w-5 h-5 mr-3" /> Secure Log Out
                   </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="p-8 pt-0 max-w-7xl mx-auto w-full pb-20 relative">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'sessions' && renderSessions()}
          {activeTab === 'leaderboard' && renderLeaderboard()}
          {activeTab === 'inbox' && renderInbox()}
          {activeTab === 'settings' && renderSettings()}
        </div>
      </main>

      {/* 🔴 CREATE SESSION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0f172a]/60 backdrop-blur-md transition-all">
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
                  <input type="text" required value={formData.module_name} onChange={(e) => setFormData({...formData, module_name: e.target.value})} placeholder="e.g., React Basics" className="w-full px-5 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:bg-white focus:border-fuchsia-500 focus:ring-4 focus:ring-fuchsia-500/10 outline-none transition-all font-bold text-gray-900 placeholder-gray-400" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-black text-gray-700 uppercase tracking-widest mb-2">Series/Tag</label>
                    <input type="text" required value={formData.semester} onChange={(e) => setFormData({...formData, semester: e.target.value})} placeholder="e.g., Masterclass" className="w-full px-5 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:bg-white focus:border-fuchsia-500 focus:ring-4 focus:ring-fuchsia-500/10 outline-none transition-all font-bold text-gray-900 placeholder-gray-400" />
                  </div>
                  <div>
                    <label className="block text-sm font-black text-gray-700 uppercase tracking-widest mb-2">Capacity</label>
                    <input type="number" min="2" max="50" required value={formData.max_members} onChange={(e) => setFormData({...formData, max_members: parseInt(e.target.value)})} className="w-full px-5 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:bg-white focus:border-fuchsia-500 focus:ring-4 focus:ring-fuchsia-500/10 outline-none transition-all font-black text-gray-900 text-center" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-black text-slate-700 uppercase tracking-widest mb-2 flex items-center"><Youtube className="w-4 h-4 mr-2 text-rose-500"/> YouTube Recording Link</label>
                  <input type="url" required value={formData.session_link} onChange={(e) => setFormData({...formData, session_link: e.target.value})} placeholder="https://youtube.com/watch?v=..." className="w-full px-5 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:bg-white focus:border-rose-400 outline-none transition-all font-bold text-rose-600 placeholder-gray-400" />
                </div>
                
                {/* 🔴 Premium Optional Quiz Field with Toggle */}
                <div className={`p-5 rounded-2xl border-2 transition-all duration-300 ${showQuizInput ? 'bg-fuchsia-50/50 border-fuchsia-200' : 'bg-gray-50 border-gray-100'}`}>
                  <div className="flex items-center justify-between cursor-pointer" onClick={() => { setShowQuizInput(!showQuizInput); if(showQuizInput) setFormData({...formData, quiz_link: ''}); }}>
                    <div>
                      <label className="text-sm font-black text-gray-700 uppercase tracking-widest flex items-center cursor-pointer"><Target className={`w-4 h-4 mr-2 ${showQuizInput ? 'text-fuchsia-500' : 'text-gray-400'}`}/> Add a Quiz? (Optional)</label>
                      <p className="text-[10px] text-gray-500 font-bold mt-0.5">Sessions with quizzes get 40% more engagement.</p>
                    </div>
                    <div className={`w-12 h-6 rounded-full relative shadow-inner transition-colors ${showQuizInput ? 'bg-fuchsia-500' : 'bg-gray-300'}`}>
                      <div className={`w-4 h-4 bg-white rounded-full absolute top-1 shadow-sm transition-all ${showQuizInput ? 'right-1' : 'left-1'}`}></div>
                    </div>
                  </div>
                  {showQuizInput && (
                    <div className="mt-4 animate-in slide-in-from-top-2">
                      <input type="url" value={formData.quiz_link} onChange={(e) => setFormData({...formData, quiz_link: e.target.value})} placeholder="Paste Google Form link here..." className="w-full px-5 py-3.5 bg-white border-2 border-fuchsia-100 rounded-2xl focus:bg-white focus:border-fuchsia-500 focus:ring-4 focus:ring-fuchsia-500/10 outline-none transition-all font-bold text-fuchsia-600 placeholder-fuchsia-300 shadow-sm" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0f172a]/60 backdrop-blur-md transition-all">
          <div className="bg-white rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.3)] w-full max-w-md overflow-hidden border border-white/40 transform transition-all scale-100 opacity-100">
            <div className="relative p-8 bg-gradient-to-br from-indigo-900 to-slate-900 text-white text-left overflow-hidden">
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
                  <label className="block text-sm font-black text-slate-700 uppercase tracking-widest mb-2 flex items-center"><CalendarDays className="w-4 h-4 mr-2"/> Date & Time</label>
                  <input type="datetime-local" required value={timerForm.targetDate} onChange={(e) => setTimerForm({ ...timerForm, targetDate: e.target.value })} className="w-full px-5 py-3.5 bg-white border-2 border-slate-200 rounded-2xl focus:border-fuchsia-500 outline-none transition-all font-bold text-slate-900 shadow-sm" />
                </div>
              </div>
              <div className="mt-8 flex space-x-4">
                <button type="button" onClick={() => {setLiveSession(null); setTimerModalOpen(false); setTimeLeft({ days: '00', hours: '00', mins: '00', secs: '00' });}} className="flex-1 py-4 bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white font-black rounded-2xl transition-colors border border-rose-100 shadow-sm">Clear Timer</button>
                <button type="submit" className="flex-[2] py-4 bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-black rounded-2xl transition-all shadow-lg flex items-center justify-center">Start Countdown ⏱️</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🔴 EDIT SESSION MODAL */}
      {editModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0f172a]/70 backdrop-blur-md transition-all">
          <div className="bg-white rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.5)] w-full max-w-lg max-h-[90vh] overflow-y-auto border border-indigo-500/30 transform transition-all scale-100 opacity-100 no-scrollbar">
            <div className="relative p-8 bg-gradient-to-br from-indigo-900 to-slate-900 text-white text-left overflow-hidden">
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
                  <label className="block text-sm font-black text-slate-700 uppercase tracking-widest mb-2 flex items-center"><Youtube className="w-4 h-4 mr-2 text-rose-500"/> YouTube Recording Link</label>
                  <input type="url" required value={editModal.formData.session_link} onChange={(e) => setEditModal({ ...editModal, formData: { ...editModal.formData, session_link: e.target.value } })} className="w-full px-5 py-3.5 bg-white border-2 border-slate-200 rounded-2xl focus:border-rose-400 outline-none transition-all font-bold text-rose-600 shadow-sm" />
                </div>

                {/* 🔴 Premium Optional Quiz Field with Toggle for Edit */}
                <div className={`p-5 rounded-2xl border-2 transition-all duration-300 ${showEditQuizInput ? 'bg-indigo-50/50 border-indigo-200' : 'bg-gray-50 border-gray-100'}`}>
                  <div className="flex items-center justify-between cursor-pointer" onClick={() => { setShowEditQuizInput(!showEditQuizInput); if(showEditQuizInput) setEditModal({ ...editModal, formData: { ...editModal.formData, quiz_link: '' } }); }}>
                    <div>
                      <label className="text-sm font-black text-gray-700 uppercase tracking-widest flex items-center cursor-pointer"><Target className={`w-4 h-4 mr-2 ${showEditQuizInput ? 'text-indigo-500' : 'text-gray-400'}`}/> Update Quiz? (Optional)</label>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0f172a]/60 backdrop-blur-md transition-all">
          <div className="bg-white rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.3)] w-full max-w-lg overflow-hidden border border-white/40 transform transition-all scale-100 opacity-100">
            <div className="relative p-8 bg-gradient-to-br from-gray-900 to-gray-800 text-white text-left overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-fuchsia-500 rounded-full mix-blend-overlay filter blur-[50px] opacity-20"></div>
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4 border border-white/20"><Users className="w-6 h-6 text-white" /></div>
                  <h3 className="text-2xl font-black tracking-tight leading-tight mb-1">{manageModal.group.module_name}</h3>
                  <p className="text-gray-400 font-bold text-sm">Enrolled Students ({manageModal.group.current_members.length}/{manageModal.group.max_members})</p>
                </div>
                <button onClick={() => setManageModal({ isOpen: false, group: null, students: [], isLoading: false })} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"><X className="w-5 h-5 text-white" /></button>
              </div>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4 no-scrollbar">
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
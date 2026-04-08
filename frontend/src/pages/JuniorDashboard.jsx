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
  Youtube, LayoutDashboard, UserCheck, ShieldCheck, Mail, Briefcase, Code,
  Trash2, CheckSquare, Settings, Bookmark, User, BellRing, Lock,
  Camera, Key, Smartphone, Globe, Send, Save, MessageSquare, Inbox, CornerDownRight, CheckCheck, Lightbulb, Activity, Edit3
} from 'lucide-react';

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

  // 🔴 PROFILE UPDATE STATE
  const fileInputRef = useRef(null);
  const [profileData, setProfileData] = useState({ name: '', headline: '', bio: '' });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

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
    const saved = localStorage.getItem('mentorRatings');
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
    type: 'Question' 
  });
  const [isSendingMsg, setIsSendingMsg] = useState(false);
  const [msgSuccess, setMsgSuccess] = useState(false);

  // Thread Reply States
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  
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
    localStorage.setItem('mentorRatings', JSON.stringify(mentorRatings));
  }, [mentorRatings]);

  // Sync Messages periodically to get replies in real-time
  useEffect(() => {
    const interval = setInterval(() => {
      const saved = localStorage.getItem('platformMessages');
      if(saved) setPlatformMessages(JSON.parse(saved));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async (token) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const profileRes = await axios.get('http://localhost:5000/api/auth/profile', config);
      
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
        headline: localExtras.headline || '',
        bio: localExtras.bio || ''
      }));

      const groupRes = await axios.get('http://localhost:5000/api/groups', config);
      setGroups(groupRes.data.reverse());

      const mentorRes = await axios.get('http://localhost:5000/api/auth/mentors', config); 
      setMentors(mentorRes.data);

    } catch (error) {
      console.error("Dashboard fetch error:", error);
      if(error.response && error.response.status === 401) {
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

      const response = await axios.put(`http://localhost:5000/api/groups/join/${groupId}`, {
        userId: user?._id 
      }, config);
      
      alert(`⏳ ${response.data.message}`); 
      if(userInfoStr) {
        fetchData(JSON.parse(userInfoStr).token); 
      }
    } catch (error) {
      alert(`⚠️ ${error.response?.data?.message || "Error joining group"}`);
    }
  };

  const handleDropSession = async (groupId, moduleName) => {
    const confirmDrop = window.confirm(`Are you sure you want to unenroll from "${moduleName}"? You will lose access to the materials.`);
    if(!confirmDrop) return;

    try {
      const userInfoStr = localStorage.getItem('userInfo');
      const token = userInfoStr ? JSON.parse(userInfoStr).token : '';
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const response = await axios.delete(`http://localhost:5000/api/groups/${groupId}/remove-student/${user?._id}`, config);
      alert(`✅ Successfully dropped from ${moduleName}`);
      if(userInfoStr) {
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
    setMentorRatings(prev => ({ ...prev, [mentorId]: rating }));
  };

  // 🔴 SEND INITIAL MESSAGE LOGIC
  const handleSendContact = async (e) => {
    e.preventDefault();
    if(!contactModal.message.trim()) return;
    
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
    if(!editingText.trim()) return;
    const updated = platformMessages.map(m => m.id === id ? { ...m, text: editingText } : m);
    setPlatformMessages(updated);
    localStorage.setItem('platformMessages', JSON.stringify(updated));
    setEditingMsgId(null);
    setEditingText("");
    alert("✅ Message updated!");
  };

  const handleDeleteMessage = (id) => {
    const confirmDel = window.confirm("🗑️ Are you sure you want to permanently delete this message?");
    if(!confirmDel) return;
    const updated = platformMessages.filter(m => m.id !== id);
    setPlatformMessages(updated);
    localStorage.setItem('platformMessages', JSON.stringify(updated));
  };

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
    setEditingMsgId(null);
    setEditingText('');
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

  const markReplyAsRead = (msgId) => {
    const updated = platformMessages.map(m => m.id === msgId ? {...m, readByJunior: true} : m);
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
      alert("✅ Profile updated successfully!");
    }, 800); 
  };

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/login', { replace: true });
  };

  const handleGlobalSearch = (e) => {
    const query = e.target.value;
    setExploreSearch(query);
    if(query.trim().length > 0 && !isExploreOpen) {
      setIsExploreOpen(true);
    }
  };

  const myMessages = platformMessages.filter(m => m.senderId === user?._id).sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));
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
      
      {/* 🚀 Premium Hero Banner - Modern Tech Theme */}
      <div className="relative rounded-[2.5rem] p-10 md:p-14 text-white shadow-2xl overflow-hidden group border border-slate-700/50">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#312e81]"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.05]"></div>
        
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-blue-500 rounded-full mix-blend-screen filter blur-[150px] opacity-40 group-hover:opacity-60 transition-opacity duration-1000"></div>
        <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-violet-600 rounded-full mix-blend-screen filter blur-[150px] opacity-30 group-hover:opacity-50 transition-opacity duration-1000"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10 text-left">
          <div className="w-full md:w-2/3">
            <div className="flex items-center space-x-3 mb-6 bg-white/5 w-fit px-5 py-2.5 rounded-full border border-white/10 backdrop-blur-md shadow-sm">
              <Sparkles className="w-4 h-4 text-cyan-300 animate-pulse" />
              <p className="text-blue-100 font-bold tracking-[0.2em] uppercase text-[10px]">{greeting}, {user?.name?.split(' ')[0] || 'Learner'}!</p>
            </div>
            <h2 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter leading-[1.05]">
              Accelerate Your <br/> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-indigo-300 to-cyan-300">
                Tech Career.
              </span>
            </h2>
            <p className="text-slate-300 text-lg mb-10 max-w-xl leading-relaxed font-medium">
              Gain access to <span className="text-white font-black bg-white/10 px-3 py-1 rounded-lg border border-white/20">{groups.length} exclusive sessions</span>. Learn directly from top-rated industry mentors and level up your skills.
            </p>
            
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <button onClick={() => setIsExploreOpen(true)} className="flex items-center justify-center px-8 py-4 bg-white text-slate-900 rounded-2xl font-black text-lg hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,255,255,0.15)] group/btn">
                <Compass className="w-6 h-6 mr-3 group-hover/btn:rotate-45 transition-transform" /> Explore Sessions
              </button>
              <button onClick={() => setActiveTab('schedule')} className="flex items-center justify-center px-8 py-4 bg-white/10 text-white border border-white/20 rounded-2xl font-black text-lg hover:bg-white/20 hover:shadow-lg transition-all backdrop-blur-sm">
                View My Path
              </button>
            </div>
          </div>
          
          <div 
            onClick={() => setActiveTab('leaderboard')}
            className="w-full md:w-auto bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-2xl p-10 rounded-[2.5rem] border border-white/20 shadow-2xl transform hover:-translate-y-2 transition-transform duration-500 relative overflow-hidden group/card cursor-pointer hover:scale-[1.02]"
            title="Click to view full Leaderboard"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500"></div>
            <div className="flex items-center justify-between mb-6 gap-8">
              <p className="text-sm text-slate-200 font-black uppercase tracking-widest">Global Rank</p>
              <div className="p-3 bg-gradient-to-br from-blue-500 to-violet-600 rounded-2xl shadow-lg group-hover/card:animate-bounce"><Award className="w-6 h-6 text-white" /></div>
            </div>
            <p className="text-6xl font-black text-white flex items-center tracking-tighter">
              #{user?.points > 0 ? Math.max(1, Math.floor(2500 / (user.points || 1))) : Math.max(1, Math.floor(5000 / (calculatedXP || 1)))}
            </p>
            <p className="text-blue-200 font-bold mb-6">{calculatedXP} XP Earned</p>
            <div className="px-5 py-3 bg-emerald-500/20 border border-emerald-500/30 rounded-xl inline-flex w-full justify-center">
              <p className="text-emerald-300 text-sm font-black flex items-center"><TrendingUp className="w-4 h-4 mr-2"/> Top 10% Learner</p>
            </div>
          </div>
        </div>
      </div>

      {/* 🔴 PREMIUM QUICK METRICS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex items-center justify-between hover:-translate-y-1 transition-transform group">
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Enrolled Classes</p>
            <h4 className="text-3xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">{enrolledCount}</h4>
          </div>
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 border border-blue-100 shadow-sm group-hover:scale-110 transition-transform"><BookOpen className="w-6 h-6"/></div>
        </div>
        <div className="bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex items-center justify-between hover:-translate-y-1 transition-transform group">
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Certifications</p>
            <h4 className="text-3xl font-black text-slate-900 group-hover:text-violet-600 transition-colors">{badgesCount}</h4>
          </div>
          <div className="w-12 h-12 bg-violet-50 rounded-2xl flex items-center justify-center text-violet-600 border border-violet-100 shadow-sm group-hover:scale-110 transition-transform"><Award className="w-6 h-6"/></div>
        </div>
        <div className="bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex items-center justify-between hover:-translate-y-1 transition-transform group">
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Study Streak</p>
            <h4 className="text-3xl font-black text-slate-900 group-hover:text-rose-500 transition-colors">12 Days</h4>
          </div>
          <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 border border-rose-100 shadow-sm group-hover:scale-110 transition-transform"><Flame className="w-6 h-6"/></div>
        </div>
        <div className="bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex items-center justify-between hover:-translate-y-1 transition-transform group">
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Current Level</p>
            <h4 className="text-3xl font-black text-slate-900 group-hover:text-emerald-500 transition-colors">Lv. {currentLevel}</h4>
          </div>
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 border border-emerald-100 shadow-sm group-hover:scale-110 transition-transform"><Activity className="w-6 h-6"/></div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        
        <div className="xl:col-span-2 space-y-8">
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
                  className={`bg-white p-8 rounded-[2rem] shadow-sm border-2 transition-all duration-500 group relative overflow-hidden text-left flex flex-col
                    ${isEnrolled ? 'border-emerald-400 shadow-emerald-100/50' : 
                      isPending ? 'border-amber-300' :
                      isFull ? 'border-slate-200 opacity-80' : 
                      'border-transparent hover:border-blue-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10'}`}
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
                      <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest flex items-center mt-0.5"><ShieldCheck className="w-3 h-3 mr-1 text-emerald-500"/> Verified</p>
                    </div>
                  </div>
                  
                  <div className="mb-8 mt-auto">
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Seats Filled</span>
                      <span className={`text-sm font-black ${fillPercentage >= 80 ? 'text-rose-500' : 'text-blue-600'}`}>
                        {Math.round(fillPercentage)}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${fillPercentage >= 80 ? 'bg-rose-500' : 'bg-gradient-to-r from-blue-500 to-cyan-400'}`} 
                        style={{ width: `${fillPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    {isEnrolled ? (
                      <div className="flex space-x-2">
                        <a href={group.session_link} target="_blank" rel="noreferrer" className="flex-1 py-3.5 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white font-black rounded-2xl text-center flex items-center justify-center shadow-sm border border-rose-100 transition-all text-sm">
                          <Youtube className="w-4 h-4 mr-2" /> Play
                        </a>
                        {group.quiz_link && (
                          <a href={group.quiz_link} target="_blank" rel="noreferrer" className="flex-1 py-3.5 bg-cyan-50 hover:bg-cyan-600 text-cyan-700 hover:text-white font-black rounded-2xl text-center flex items-center justify-center shadow-sm border border-cyan-100 transition-all text-sm">
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
                        Enroll Now <ChevronRight className="w-5 h-5 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-8 text-left">
          
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 flex flex-col">
            <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center justify-between">
              Trophy Room <Award className="w-7 h-7 text-amber-500" />
            </h3>
            <div className="grid grid-cols-3 gap-4 w-full">
              {user?.badges && user.badges.length > 0 ? user.badges.slice(0,6).map((badge, i) => (
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
                  <button onClick={() => deleteGoal(goal.id)} className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )) : (
                <p className="text-center text-slate-400 text-sm font-bold py-4">No tasks added yet.</p>
              )}
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#0f172a] to-blue-900 rounded-[2.5rem] shadow-2xl p-8 text-white relative overflow-hidden group cursor-pointer">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500 rounded-full filter blur-[60px] opacity-30 group-hover:opacity-50 transition-opacity"></div>
            <div className="relative z-10">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-ping"></div>
                <h3 className="text-xs font-black text-cyan-300 uppercase tracking-widest">Global Event</h3>
              </div>
              <p className="text-3xl font-black mb-2 leading-tight">Monthly <br/>Hackathon</p>
              <p className="text-blue-200 text-sm font-medium mb-8">Compete with peers, build projects, and win 500 XP!</p>
              <button onClick={() => {setIsExploreOpen(true); setExploreSearch('Hackathon');}} className="w-full py-4 bg-white text-blue-900 font-black rounded-2xl transition-all hover:bg-blue-50 shadow-xl group-hover:scale-[1.02]">
                Register Now
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );

  // ---------------------------------------------------------
  // 🟢 TAB 6: NEW INBOX / MESSAGES UI (Premium Continuous Chat)
  // ---------------------------------------------------------
  const renderInbox = () => (
    <div className="animate-in slide-in-from-right-8 duration-500 text-left space-y-8 max-w-5xl mx-auto">
      <div className="bg-gradient-to-r from-[#0f172a] to-blue-900 rounded-[3rem] p-10 text-white shadow-xl relative overflow-hidden flex items-center">
         <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full mix-blend-overlay filter blur-[40px]"></div>
         <div className="w-24 h-24 bg-white/10 rounded-[2rem] flex items-center justify-center mr-8 border border-white/20 backdrop-blur-md">
            <Inbox className="w-12 h-12 text-cyan-300" />
         </div>
         <div className="relative z-10">
            <h3 className="text-4xl font-black mb-2">My Messages</h3>
            <p className="text-blue-200 font-medium text-lg">Track your questions, feedback, and mentor replies.</p>
         </div>
      </div>

      <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 p-8 min-h-[500px]">
        {myMessages.length > 0 ? (
          <div className="space-y-8">
            {myMessages.map(msg => {
              const thread = getThread(msg);
              // Read status handling: Unread if the latest is unread
              const unread = !msg.readByJunior && msg.reply !== null;
              return (
              <div key={msg.id} className={`p-6 rounded-[2rem] border-2 transition-all ${unread ? 'border-cyan-300 bg-cyan-50/30' : 'border-slate-50 bg-white shadow-sm'}`}>
                
                {/* Header Info */}
                <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                  <div className="flex items-center">
                    <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-lg border border-blue-100 mr-4">
                      {msg.type}
                    </span>
                    <p className="text-xs font-bold text-slate-400">Message to <span className="text-slate-800 font-black">{msg.receiverName}</span></p>
                  </div>
                  <div className="flex items-center space-x-3">
                     {unread && (
                        <button onClick={() => markReplyAsRead(msg.id)} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 transition-colors flex items-center text-[10px] font-black uppercase tracking-widest">
                          <CheckCheck className="w-3 h-3 mr-1"/> Mark Read
                        </button>
                     )}
                     <span className="text-xs font-bold text-slate-400">{new Date(msg.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar flex flex-col">
                  
                  {/* Junior's Initial Message (Right Aligned) WITH CRUD */}
                  <div className="flex flex-col items-end group/msg">
                     <p className="text-[10px] font-bold text-slate-400 mb-1 mr-1">You <span className="ml-2 text-blue-400">{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span></p>
                     
                     {/* Edit Mode UI */}
                     {editingMsgId === msg.id ? (
                       <div className="bg-white border-2 border-blue-400 p-4 rounded-2xl shadow-lg w-full max-w-[85%] sm:max-w-[70%]">
                         <textarea 
                           className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold focus:outline-none focus:border-blue-500 mb-3 resize-none"
                           value={editingText}
                           onChange={(e) => setEditingText(e.target.value)}
                           rows="3"
                         />
                         <div className="flex justify-end space-x-2">
                           <button onClick={() => setEditingMsgId(null)} className="px-4 py-2 text-xs font-black text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
                           <button onClick={() => saveEditedMessage(msg.id)} className="px-4 py-2 text-xs font-black text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-colors flex items-center"><Save className="w-3 h-3 mr-1"/> Update</button>
                         </div>
                       </div>
                     ) : (
                       // Normal View Mode UI
                       <div className="flex items-end">
                         {/* Edit/Delete Actions (Only visible if thread has NO replies yet) */}
                         {thread.length === 0 && (
                           <div className="flex items-center space-x-1 mr-3 opacity-0 group-hover/msg:opacity-100 transition-opacity">
                             <button onClick={() => startEditingMessage(msg)} className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl transition-all shadow-sm" title="Edit Message"><Edit3 className="w-3.5 h-3.5" /></button>
                             <button onClick={() => handleDeleteMessage(msg.id)} className="p-2 bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl transition-all shadow-sm" title="Delete Message"><Trash2 className="w-3.5 h-3.5" /></button>
                           </div>
                         )}
                         <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white p-4 rounded-2xl rounded-tr-none max-w-[85%] sm:max-w-[100%] shadow-[0_4px_15px_rgba(37,99,235,0.3)] inline-block">
                            <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                         </div>
                       </div>
                     )}
                  </div>
                  
                  {/* Dynamic Thread Rendering */}
                  {thread.map((reply, i) => {
                    const isMe = reply.senderId === user._id;
                    if(isMe) {
                      // JUNIOR REPLY IN THREAD (Right Aligned) WITH CRUD
                      return (
                        <div key={reply.id || i} className="flex flex-col items-end group/msg animate-in fade-in slide-in-from-right-4 w-full">
                           <p className="text-[10px] font-bold text-slate-400 mb-1 mr-1">You <span className="ml-2 text-blue-400">{new Date(reply.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span></p>
                           
                           {editingMsgId === reply.id ? (
                             // EDIT REPLY UI
                             <div className="bg-white border-2 border-blue-400 p-4 rounded-2xl shadow-lg w-full max-w-[85%] sm:max-w-[70%]">
                               <textarea 
                                 className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold focus:outline-none focus:border-blue-500 mb-3 resize-none"
                                 value={editingText}
                                 onChange={(e) => setEditingText(e.target.value)}
                                 rows="3"
                               />
                               <div className="flex justify-end space-x-2">
                                 <button onClick={() => setEditingMsgId(null)} className="px-4 py-2 text-xs font-black text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
                                 <button onClick={() => handleEditThreadReply(msg.id, reply.id, editingText)} className="px-4 py-2 text-xs font-black text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-colors flex items-center"><Save className="w-3 h-3 mr-1"/> Update</button>
                               </div>
                             </div>
                           ) : (
                             // NORMAL REPLY UI
                             <div className="flex items-end">
                               <div className="flex items-center space-x-1 mr-3 opacity-0 group-hover/msg:opacity-100 transition-opacity">
                                 <button onClick={() => {setEditingMsgId(reply.id); setEditingText(reply.text);}} className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg transition-all shadow-sm" title="Edit Reply"><Edit3 className="w-3.5 h-3.5" /></button>
                                 <button onClick={() => handleDeleteThreadReply(msg.id, reply.id)} className="p-1.5 bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg transition-all shadow-sm" title="Delete Reply"><Trash2 className="w-3.5 h-3.5" /></button>
                               </div>
                               <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white p-4 rounded-2xl rounded-tr-none max-w-[85%] sm:max-w-[100%] shadow-[0_4px_15px_rgba(37,99,235,0.3)] text-left inline-block">
                                  <p className="text-sm font-medium leading-relaxed">{reply.text}</p>
                               </div>
                             </div>
                           )}
                        </div>
                      );
                    } else {
                      // MENTOR REPLY IN THREAD (Left Aligned)
                      return (
                        <div key={reply.id || i} className="flex flex-col items-start animate-in fade-in slide-in-from-left-4">
                           <div className="flex items-center mb-1 ml-1">
                              <div className="w-6 h-6 bg-violet-100 text-violet-600 rounded-full flex items-center justify-center text-[10px] font-black mr-2 border border-violet-200 overflow-hidden">
                                 {reply.senderName?.charAt(0) || msg.receiverName.charAt(0)}
                              </div>
                              <p className="text-[10px] font-bold text-slate-500">{reply.senderName || msg.receiverName} <span className="ml-2 text-violet-500">{new Date(reply.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span></p>
                           </div>
                           <div className="bg-slate-100 text-slate-800 p-4 rounded-2xl rounded-tl-none max-w-[85%] sm:max-w-[70%] border border-slate-200 shadow-sm">
                              <p className="text-sm font-medium leading-relaxed">{reply.text}</p>
                           </div>
                        </div>
                      );
                    }
                  })}

                  {/* 🔴 CONTINUOUS CHAT REPLY EDITOR FOR JUNIOR */}
                  <div className="flex flex-col items-end w-full mt-4 pt-4 border-t border-slate-100">
                    {replyingTo === msg.id ? (
                      <div className="bg-white border-2 border-blue-300 p-5 rounded-[2.5rem] rounded-tr-xl shadow-[0_10px_40px_rgba(37,99,235,0.15)] w-full max-w-[95%] sm:max-w-[85%] animate-in slide-in-from-bottom-4 focus-within:border-blue-500 focus-within:shadow-[0_10px_40px_rgba(37,99,235,0.25)] transition-all relative">
                        
                        <div className="absolute -top-4 -right-4 bg-gradient-to-br from-blue-500 to-cyan-500 p-3 rounded-2xl shadow-lg shadow-blue-500/40 animate-bounce">
                          <MessageSquare className="w-5 h-5 text-white" />
                        </div>
                        
                        <div className="flex items-center mb-4">
                          <CornerDownRight className="w-5 h-5 text-blue-500 mr-2" />
                          <span className="text-xs font-black text-blue-600 uppercase tracking-widest">Replying to {msg.receiverName.split(' ')[0]}</span>
                        </div>

                        <div className="relative group/editor">
                          <textarea 
                            className="w-full bg-slate-50/50 border-2 border-slate-200 rounded-3xl p-5 text-sm font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-blue-400 mb-4 resize-none transition-all placeholder-slate-400 shadow-inner custom-scrollbar"
                            placeholder="Type your message..."
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            rows="3"
                            autoFocus
                          />
                        </div>

                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                          <div className="flex items-center bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 w-fit">
                            <Activity className={`w-4 h-4 mr-2 ${replyText.length > 500 ? 'text-rose-500 animate-pulse' : 'text-blue-500'}`} />
                            <span className={`text-[10px] font-black uppercase tracking-widest ${replyText.length > 500 ? 'text-rose-500' : 'text-slate-500'}`}>
                              {replyText.length} / 500 Characters
                            </span>
                          </div>
                          
                          <div className="flex space-x-3 w-full sm:w-auto">
                            <button onClick={() => {setReplyingTo(null); setReplyText('');}} className="flex-1 sm:flex-none px-6 py-3.5 text-xs font-black text-slate-500 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 border border-transparent rounded-2xl transition-all shadow-sm">
                              Cancel
                            </button>
                            <button onClick={() => handleThreadReply(msg.id)} disabled={!replyText.trim() || replyText.length > 500} className="flex-1 sm:flex-none px-8 py-3.5 text-xs font-black text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-2xl shadow-xl shadow-blue-500/30 transition-all flex items-center justify-center hover:-translate-y-1 group/send disabled:opacity-50 disabled:hover:translate-y-0">
                              Send <Send className="w-4 h-4 ml-2 group-hover/send:translate-x-1 group-hover/send:-translate-y-1 transition-transform" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      // Let's allow them to reply to the thread anytime.
                      <button onClick={() => {setReplyingTo(msg.id); setReplyText('');}} className="px-6 py-3.5 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white font-black rounded-2xl transition-all shadow-sm flex items-center border border-blue-100 group">
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
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 shadow-inner border border-slate-100">
               <MessageSquare className="w-10 h-10 text-cyan-500" />
            </div>
            <h3 className="text-3xl font-black text-slate-900 mb-2">Your inbox is empty</h3>
            <p className="text-slate-500 font-medium mb-8 max-w-sm">Reach out to an expert mentor to ask questions or request a 1-on-1 session.</p>
            <button onClick={() => setActiveTab('mentors')} className="px-8 py-4 bg-blue-600 hover:bg-blue-700 transition-all hover:-translate-y-1 text-white font-black rounded-2xl shadow-lg shadow-blue-500/30 flex items-center">
               <Search className="w-5 h-5 mr-2"/> Find a Mentor
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // ---------------------------------------------------------
  // 🟢 TAB 2: MY SCHEDULE / MY PATH UI
  // ---------------------------------------------------------
  const renderSchedule = () => (
    <div className="animate-in slide-in-from-right-8 duration-500 text-left space-y-8 max-w-6xl mx-auto">
      <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 rounded-[2.5rem] p-12 text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between">
         <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full mix-blend-overlay filter blur-[50px] animate-pulse"></div>
         <div className="relative z-10">
            <h3 className="text-5xl font-black mb-4 tracking-tight">My Learning Path</h3>
            <p className="text-blue-100 font-medium text-lg max-w-lg">Track your progress, access premium materials, and take assessments to earn your industry certifications.</p>
         </div>
         <div className="relative z-10 mt-6 md:mt-0 bg-white/10 p-6 rounded-3xl border border-white/20 backdrop-blur-md text-center min-w-[200px]">
            <p className="text-sm font-black uppercase tracking-widest text-blue-200 mb-2">Completion</p>
            <p className="text-5xl font-black">{groups.filter(g => g.current_members?.includes(user?._id)).length}</p>
            <p className="text-xs font-bold text-blue-200 mt-2">Active Modules</p>
         </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
        {groups.filter(g => g.current_members?.includes(user?._id)).map((group, index) => (
          <div key={group._id} className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 hover:border-blue-300 hover:shadow-xl transition-all flex flex-col group/path relative">
            <button onClick={() => handleDropSession(group._id, group.module_name)} className="absolute top-6 right-6 p-2.5 bg-slate-50 text-slate-400 hover:bg-rose-500 hover:text-white rounded-xl transition-colors shadow-sm" title="Drop this class"><LogOut className="w-4 h-4" /></button>
            <div className="flex items-center mb-6">
              <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl group-hover/path:bg-blue-600 group-hover/path:text-white transition-colors shadow-sm mr-4"><BookOpen className="w-8 h-8" /></div>
              <div>
                <span className="text-[10px] font-black bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-xl border border-emerald-100 uppercase tracking-widest block w-fit mb-1">Active</span>
              </div>
            </div>
            <h4 className="font-black text-2xl text-slate-900 mb-2 leading-tight pr-8">{group.module_name}</h4>
            <div className="flex items-center text-slate-500 font-bold text-sm mb-8"><UserCheck className="w-4 h-4 mr-2 text-blue-400" /> By {group.senior_id?.name || 'Mentor'}</div>
            <div className="mt-auto space-y-3">
              <a href={group.session_link} target="_blank" rel="noreferrer" className="w-full py-4 bg-slate-50 hover:bg-rose-500 text-slate-700 hover:text-white font-black rounded-2xl flex items-center justify-center transition-all border border-slate-200 hover:border-rose-500 shadow-sm"><Youtube className="w-5 h-5 mr-2" /> Watch Material</a>
              {group.quiz_link && <a href={group.quiz_link} target="_blank" rel="noreferrer" className="w-full py-4 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white font-black rounded-2xl flex items-center justify-center transition-all border border-blue-100 hover:border-blue-600 shadow-sm"><Target className="w-5 h-5 mr-2" /> Take Assessment</a>}
            </div>
          </div>
        ))}
        {groups.filter(g => g.current_members?.includes(user?._id)).length === 0 && (
          <div className="col-span-full py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center shadow-sm">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6"><Compass className="w-12 h-12 text-slate-300" /></div>
            <h3 className="text-3xl font-black text-slate-900 mb-3">Your path is empty</h3>
            <p className="text-slate-500 font-medium text-lg mb-8 max-w-md">You haven't enrolled in any sessions yet.</p>
            <button onClick={() => {setActiveTab('dashboard'); setIsExploreOpen(true);}} className="px-8 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-lg hover:scale-105 transition-transform flex items-center"><Search className="w-5 h-5 mr-2"/> Browse Catalog</button>
          </div>
        )}
      </div>
    </div>
  );

  // ---------------------------------------------------------
  // 🟢 TAB 3: MENTORS UI
  // ---------------------------------------------------------
  const renderMentors = () => {
    const filteredMentors = globalRankedMentors.filter(m => m.name.toLowerCase().includes(mentorSearch.toLowerCase()));

    return (
      <div className="animate-in slide-in-from-right-8 duration-500 text-left space-y-8 max-w-7xl mx-auto relative">
        {/* 🔵 UPDATE: Changed from bg-white to bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900, and added text-white */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 p-10 rounded-[2.5rem] shadow-sm border border-white/10 relative overflow-hidden">
          {/* 🔵 UPDATE: Changed bg-blue-50 to bg-cyan-500/20 for better contrast on dark background */}
          <div className="absolute right-0 top-0 w-64 h-64 bg-cyan-500/20 rounded-bl-full -z-10"></div>
          <div>
            {/* 🔵 UPDATE: Changed text-slate-900 to text-white, and icon text color from text-blue-600 to text-cyan-300 */}
            <h3 className="text-4xl font-black text-white mb-3 flex items-center"><Users className="w-10 h-10 mr-4 text-cyan-300" /> Industry Experts</h3>
            {/* 🔵 UPDATE: Changed text-slate-500 to text-blue-100 */}
            <p className="text-blue-100 font-medium text-lg">Connect, learn, and grow with verified professionals.</p>
          </div>
          <div className="relative w-full md:w-[400px]">
            {/* 🔵 UPDATE: Changed text-slate-400 to text-blue-200 */}
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-200 w-5 h-5" />
            {/* 🔵 UPDATE: Restyled input for a dark background: changed bg-slate-50, text color, and placeholder color */}
            <input type="text" value={mentorSearch} onChange={(e) => setMentorSearch(e.target.value)} placeholder="Search expert by name..." className="w-full pl-14 pr-4 py-4 bg-white/10 border-2 border-white/20 rounded-2xl outline-none focus:bg-white/20 focus:border-cyan-300 font-bold transition-all shadow-inner text-white placeholder-blue-200" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredMentors.length > 0 ? filteredMentors.map((mentor) => {
            const currentRating = mentorRatings[mentor._id] || 5;
            // 🔴 Get perfect Global Rank
            const rank = globalRankedMentors.findIndex(m => m._id === mentor._id) + 1;

            return (
              <div key={mentor._id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center text-center group hover:shadow-2xl hover:border-blue-300 transition-all hover:-translate-y-2 relative">
                
                {/* 🔴 Dynamic Mentor Rank Badge on the Card */}
                <div className="absolute top-4 left-4 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[10px] font-black px-3 py-1.5 rounded-lg shadow-sm border border-orange-200 flex items-center">
                  <Award className="w-3 h-3 mr-1"/> Rank #{rank}
                </div>

                <div className="relative mb-6 mt-4">
                  <div className="w-28 h-28 bg-gradient-to-tr from-blue-500 to-violet-500 rounded-[2.5rem] flex items-center justify-center text-white text-5xl font-black shadow-lg group-hover:rotate-6 transition-transform duration-300 overflow-hidden">
                    {mentor.avatar ? <img src={mentor.avatar} alt="avatar" className="w-full h-full object-cover" /> : mentor.initial}
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-emerald-500 border-4 border-white p-2 rounded-full shadow-sm"><ShieldCheck className="w-5 h-5 text-white" /></div>
                </div>
                <h4 className="font-black text-slate-900 text-2xl mb-1">{mentor.name}</h4>
                <p className="text-xs text-blue-600 font-black uppercase tracking-widest mb-2 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">{mentor.headline || 'Lead Engineer'}</p>
                <p className="text-sm font-bold text-slate-500 mb-4">{mentor.xp} XP Points</p>
                
                <div className="flex items-center space-x-1 mb-8 bg-amber-50 px-4 py-2 rounded-full border border-amber-100">
                  <span className="font-black text-amber-700 mr-2 text-sm">{currentRating}.0</span>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} onClick={() => handleRateMentor(mentor._id, star)} className={`w-4 h-4 cursor-pointer transition-colors ${star <= currentRating ? 'text-amber-400 fill-amber-400' : 'text-slate-300 hover:fill-amber-200'}`} />
                  ))}
                </div>
                <button onClick={() => setContactModal({ isOpen: true, mentor: mentor, message: '', type: 'Question' })} className="w-full py-4 bg-slate-50 hover:bg-blue-600 text-slate-600 hover:text-white font-black rounded-2xl transition-all border border-slate-200 hover:border-blue-600 flex items-center justify-center mt-auto">
                  <Mail className="w-4 h-4 mr-2" /> Contact Mentor
                </button>
              </div>
            );
          }) : (
            <div className="col-span-full py-16 text-center"><p className="text-slate-400 font-bold text-xl">No experts found matching "{mentorSearch}"</p></div>
          )}
        </div>

        {/* 🔴 CONTACT MENTOR MODAL */}
        {contactModal.isOpen && contactModal.mentor && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-[#0f172a]/70 backdrop-blur-md transition-all">
            <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 border border-white/20">
              {!msgSuccess ? (
                <>
                  <div className="bg-gradient-to-r from-blue-600 to-violet-600 p-10 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full mix-blend-overlay filter blur-[40px] opacity-20"></div>
                    <button onClick={() => setContactModal({ isOpen: false, mentor: null, message: '', type: 'Question' })} className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"><X className="w-5 h-5"/></button>
                    <div className="flex items-center relative z-10">
                      <div className="w-20 h-20 bg-white rounded-[1.5rem] flex items-center justify-center text-blue-600 font-black text-3xl mr-6 shadow-inner overflow-hidden border-4 border-blue-400/30">
                        {contactModal.mentor.avatar ? <img src={contactModal.mentor.avatar} alt="avatar" className="w-full h-full object-cover" /> : contactModal.mentor.initial}
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
                          <button key={type} type="button" onClick={() => setContactModal({...contactModal, type})} className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all border-none outline-none ${contactModal.type === type ? 'bg-blue-50 text-blue-600 shadow-sm border border-blue-100' : 'bg-transparent text-slate-500 hover:bg-slate-50'}`}>
                            {type === 'Question' ? '🤔' : type === 'Feedback' ? '⭐' : '📅'} {type.split(' ')[0]}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="mb-8">
                      <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Your Message</label>
                      <div className="relative">
                        <MessageSquare className="absolute left-4 top-4 w-5 h-5 text-slate-300" />
                        <textarea required rows="4" value={contactModal.message} onChange={(e) => setContactModal({...contactModal, message: e.target.value})} placeholder={`Hi ${contactModal.mentor.name.split(' ')[0]}, I'd like to ask about...`} className="w-full bg-white border-2 border-slate-200 rounded-2xl py-4 pl-12 pr-4 font-bold text-slate-900 focus:outline-none focus:border-blue-500 shadow-sm resize-none transition-colors"></textarea>
                        <p className={`text-right text-[10px] font-black mt-2 ${contactModal.message.length > 300 ? 'text-rose-500' : 'text-slate-400'}`}>{contactModal.message.length} / 300</p>
                      </div>
                    </div>
                    <button type="submit" disabled={isSendingMsg || contactModal.message.length > 300} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-lg shadow-blue-500/30 flex items-center justify-center transition-all hover:-translate-y-1 disabled:opacity-70 disabled:hover:translate-y-0">
                      {isSendingMsg ? 'Sending...' : 'Send Message'} <Send className="w-5 h-5 ml-2" />
                    </button>
                  </form>
                </>
              ) : (
                <div className="p-16 flex flex-col items-center justify-center text-center bg-white animate-in zoom-in-95">
                  <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6 animate-bounce"><CheckCircle className="w-12 h-12 text-emerald-500" /></div>
                  <h3 className="text-3xl font-black text-slate-900 mb-2">Message Sent!</h3>
                  <p className="text-slate-500 font-medium">{contactModal.mentor.name.split(' ')[0]} will get back to you soon.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ---------------------------------------------------------
  // 🟢 TAB 4: LEADERBOARD UI 
  // ---------------------------------------------------------
  const renderLeaderboard = () => {
    // Uses the synchronized `globalRankedMentors` array
    const first = globalRankedMentors[0];
    const second = globalRankedMentors[1];
    const third = globalRankedMentors[2];

    return (
      <div className="animate-in slide-in-from-right-8 duration-500 text-left space-y-12 max-w-5xl mx-auto">
        <div className="text-center space-y-4">
          <div className="w-24 h-24 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-500/30">
            <Award className="text-white w-12 h-12" />
          </div>
          <h3 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight">Mentor Rankings</h3>
          <p className="text-slate-500 font-medium text-xl">The top experts shaping the Kuppi Space network.</p>
        </div>
        
        {/* 🔴 NEW PODIUM UI (MATCHING SCREENSHOT) */}
        <div className="flex flex-row justify-center items-end gap-4 md:gap-8 pt-12 pb-12">
          
          {/* 2nd Place (Left) */}
          {second && (
            <div className="flex flex-col items-center order-2 md:order-1 relative z-10 group mx-2 sm:mx-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-200 rounded-[1.2rem] flex items-center justify-center text-slate-600 font-black text-3xl sm:text-4xl relative z-20 shadow-md overflow-hidden border-4 border-white transition-transform duration-300 group-hover:scale-110">
                {second.avatar ? <img src={second.avatar} alt="avatar" className="w-full h-full object-cover" /> : second.initial}
              </div>
              <div className="w-28 sm:w-32 h-28 sm:h-32 bg-gradient-to-t from-slate-200 to-slate-50 rounded-t-[1.5rem] border-x border-t border-slate-300 flex flex-col items-center justify-center pt-8 sm:pt-10 mt-[-2rem] sm:mt-[-2.5rem] relative z-10 shadow-inner group-hover:-translate-y-2 transition-transform duration-300">
                <span className="text-2xl sm:text-3xl mb-1">🥈</span>
                <span className="font-black text-slate-700 text-xs sm:text-sm">{second.xp} XP</span>
              </div>
              <div className="mt-4 flex flex-col items-center">
                <p className="font-black text-slate-900 text-base sm:text-lg text-center">{second.name.split(' ')[0]}</p>
                {second.isMe && <span className="bg-fuchsia-600 text-white text-[9px] px-2 py-0.5 rounded-md uppercase tracking-widest mt-1 shadow-sm">You</span>}
              </div>
            </div>
          )}
          
          {/* 1st Place (Center) */}
          {first && (
            <div className="flex flex-col items-center order-1 md:order-2 relative z-20 group mx-2 sm:mx-4">
              <div className="absolute -top-10 text-4xl sm:text-5xl animate-bounce">👑</div>
              <div className="w-24 h-24 sm:w-28 sm:h-28 bg-amber-400 rounded-[1.5rem] flex items-center justify-center text-amber-800 font-black text-4xl sm:text-5xl relative z-20 shadow-xl overflow-hidden border-4 border-white transition-transform duration-300 group-hover:scale-110">
                {first.avatar ? <img src={first.avatar} alt="avatar" className="w-full h-full object-cover" /> : first.initial}
              </div>
              <div className="w-32 sm:w-40 h-36 sm:h-44 bg-gradient-to-t from-amber-300 to-amber-50 rounded-t-[2rem] border-x border-t border-amber-400 flex flex-col items-center justify-center pt-10 sm:pt-12 mt-[-2.5rem] sm:mt-[-3rem] relative z-10 shadow-[0_-10px_20px_rgba(251,191,36,0.2)] group-hover:-translate-y-2 transition-transform duration-300">
                <span className="text-3xl sm:text-4xl mb-1">🥇</span>
                <span className="font-black text-amber-900 text-sm sm:text-lg">{first.xp} XP</span>
              </div>
              <div className="mt-4 flex flex-col items-center">
                <p className="font-black text-slate-900 text-lg sm:text-xl text-center">{first.name.split(' ')[0]}</p>
                {first.isMe && <span className="bg-fuchsia-600 text-white text-[9px] px-2 py-0.5 rounded-md uppercase tracking-widest mt-1 shadow-sm">You</span>}
              </div>
            </div>
          )}

          {/* 3rd Place (Right) */}
          {third && (
            <div className="flex flex-col items-center order-3 relative z-10 group mx-2 sm:mx-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-orange-200 rounded-[1.2rem] flex items-center justify-center text-orange-700 font-black text-3xl sm:text-4xl relative z-20 shadow-md overflow-hidden border-4 border-white transition-transform duration-300 group-hover:scale-110">
                {third.avatar ? <img src={third.avatar} alt="avatar" className="w-full h-full object-cover" /> : third.initial}
              </div>
              <div className="w-28 sm:w-32 h-24 sm:h-28 bg-gradient-to-t from-orange-200 to-orange-50 rounded-t-[1.5rem] border-x border-t border-orange-300 flex flex-col items-center justify-center pt-8 sm:pt-10 mt-[-2rem] sm:mt-[-2.5rem] relative z-10 shadow-inner group-hover:-translate-y-2 transition-transform duration-300">
                <span className="text-2xl sm:text-3xl mb-1">🥉</span>
                <span className="font-black text-orange-800 text-xs sm:text-sm">{third.xp} XP</span>
              </div>
              <div className="mt-4 flex flex-col items-center">
                <p className="font-black text-slate-900 text-base sm:text-lg text-center">{third.name.split(' ')[0]}</p>
                {third.isMe && <span className="bg-fuchsia-600 text-white text-[9px] px-2 py-0.5 rounded-md uppercase tracking-widest mt-1 shadow-sm">You</span>}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-[3rem] shadow-xl border border-slate-100 overflow-hidden">
          <div className="p-8 bg-[#0f172a] text-white flex justify-between items-center">
            <span className="font-black uppercase tracking-widest text-sm flex items-center"><Users className="w-5 h-5 mr-3 text-cyan-400"/> Network Leaderboard</span>
            <span className="bg-white/10 border border-white/20 px-4 py-2 rounded-xl text-xs font-bold backdrop-blur-sm">Season 2026</span>
          </div>
          <div className="p-4 space-y-3 bg-slate-50/50">
            {globalRankedMentors.map((mentor, index) => {
              const rank = index + 1;
              return (
              <div key={mentor.id} className="flex items-center p-5 bg-white rounded-3xl shadow-sm border border-slate-100 hover:shadow-md hover:border-blue-200 transition-all group cursor-default">
                <div className="w-14 h-14 flex items-center justify-center font-black text-xl mr-6">
                   {rank === 1 ? <span className="text-3xl">🥇</span> : 
                    rank === 2 ? <span className="text-3xl">🥈</span> : 
                    rank === 3 ? <span className="text-3xl">🥉</span> : 
                    <span className="text-slate-400 bg-slate-100 w-10 h-10 rounded-xl flex items-center justify-center">{rank}</span>}
                </div>
                <div className={`w-14 h-14 rounded-[1.2rem] bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-black text-xl mr-6 group-hover:bg-blue-600 group-hover:text-white transition-colors overflow-hidden`}>
                  {mentor.avatar ? <img src={mentor.avatar} alt="avatar" className="w-full h-full object-cover" /> : mentor.initial}
                </div>
                <div className="flex-1">
                  <p className="font-black text-xl text-slate-900 leading-tight mb-1">{mentor.name}</p>
                  <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">{mentor.level}</p>
                </div>
                <div className="text-right pr-4">
                  <p className="font-black text-3xl text-slate-900 group-hover:text-blue-600 transition-colors">{mentor.xp}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">XP Points</p>
                </div>
              </div>
            )})}
            {globalRankedMentors.length === 0 && (
              <div className="py-10 text-center text-slate-500 font-bold">No mentors registered yet.</div>
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
      <div className="bg-gradient-to-r from-[#0f172a] to-blue-900 rounded-[3rem] p-10 text-white shadow-xl relative overflow-hidden flex items-center">
         <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full mix-blend-overlay filter blur-[40px]"></div>
         <div className="w-24 h-24 bg-white/10 rounded-[2rem] flex items-center justify-center mr-8 border border-white/20 backdrop-blur-md"><Settings className="w-12 h-12 text-cyan-300" /></div>
         <div className="relative z-10">
            <h3 className="text-4xl font-black mb-2">Account Settings</h3>
            <p className="text-blue-200 font-medium text-lg">Manage your personal information and platform preferences.</p>
         </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-72 space-y-3">
          <button 
             onClick={() => setSettingsTab('profile')} 
             style={{ backgroundColor: settingsTab === 'profile' ? '#1e3a8a' : 'transparent' }}
             className={`w-full flex items-center px-6 py-5 rounded-[1.5rem] font-black transition-all border-none outline-none ${settingsTab === 'profile' ? 'text-white shadow-md translate-x-2' : 'text-slate-500 hover:bg-blue-50 border border-slate-100'}`}
          >
             <User className="w-5 h-5 mr-4" /> Personal Info
          </button>
          <button 
             onClick={() => setSettingsTab('security')} 
             style={{ backgroundColor: settingsTab === 'security' ? '#1e3a8a' : 'transparent' }}
             className={`w-full flex items-center px-6 py-5 rounded-[1.5rem] font-black transition-all border-none outline-none ${settingsTab === 'security' ? 'text-white shadow-md translate-x-2' : 'text-slate-500 hover:bg-blue-50 border border-slate-100'}`}
          >
             <Key className="w-5 h-5 mr-4" /> Security & Password
          </button>
          <button 
             onClick={() => setSettingsTab('notifications')} 
             style={{ backgroundColor: settingsTab === 'notifications' ? '#1e3a8a' : 'transparent' }}
             className={`w-full flex items-center px-6 py-5 rounded-[1.5rem] font-black transition-all border-none outline-none ${settingsTab === 'notifications' ? 'text-white shadow-md translate-x-2' : 'text-slate-500 hover:bg-blue-50 border border-slate-100'}`}
          >
             <BellRing className="w-5 h-5 mr-4" /> Notifications
          </button>
        </div>

        <div className="flex-1 bg-white rounded-[3rem] shadow-sm border border-slate-100 p-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-blue-50 rounded-bl-full -z-10 opacity-50"></div>

          {settingsTab === 'profile' && (
            <div className="animate-in fade-in duration-500">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 mb-10">
                <div className="relative group">
                  <div className="w-36 h-36 rounded-[2.5rem] bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-white text-5xl font-black shadow-xl group-hover:scale-105 transition-transform overflow-hidden border-4 border-white">
                     {user?.avatar ? <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" /> : (user?.name ? user.name.charAt(0).toUpperCase() : 'U')}
                  </div>
                  <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} className="hidden" accept="image/*" />
                  <button onClick={() => fileInputRef.current.click()} className="absolute -bottom-3 -right-3 p-3 bg-white text-blue-600 rounded-2xl shadow-lg border border-slate-100 hover:bg-blue-50 hover:scale-110 transition-all"><Camera className="w-5 h-5" /></button>
                </div>
                <div className="text-center sm:text-left mt-4 sm:mt-0">
                  <h4 className="text-3xl font-black text-slate-900">{user?.name || 'Student User'}</h4>
                  <p className="text-slate-500 font-bold mb-4 text-lg">{user?.email || 'user@example.com'}</p>
                  <span className="px-5 py-2 bg-indigo-50 text-indigo-600 text-xs font-black uppercase tracking-widest rounded-xl border border-indigo-100">Pro Learner</span>
                </div>
              </div>
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2"><label className="text-xs font-black text-slate-400 uppercase tracking-widest">Full Name</label><div className="relative"><User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" /><input type="text" value={profileData.name} onChange={(e) => setProfileData({...profileData, name: e.target.value})} className="w-full pl-14 pr-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl font-bold text-slate-900 focus:bg-white focus:border-blue-400 outline-none transition-all" /></div></div>
                  <div className="space-y-2"><label className="text-xs font-black text-slate-400 uppercase tracking-widest">Email Address</label><div className="relative"><Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" /><input type="email" defaultValue={user?.email || ''} readOnly className="w-full pl-14 pr-4 py-4 bg-slate-100 border-2 border-transparent text-slate-400 rounded-2xl font-bold outline-none cursor-not-allowed" /></div></div>
                  <div className="space-y-2 md:col-span-2"><label className="text-xs font-black text-slate-400 uppercase tracking-widest">Professional Headline</label><div className="relative"><Briefcase className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" /><input type="text" value={profileData.headline} onChange={(e) => setProfileData({...profileData, headline: e.target.value})} placeholder="e.g. Software Engineering Undergrad, UI/UX Enthusiast" className="w-full pl-14 pr-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl font-bold text-slate-900 focus:bg-white focus:border-blue-400 outline-none transition-all" /></div></div>
                  <div className="space-y-2 md:col-span-2"><label className="text-xs font-black text-slate-400 uppercase tracking-widest">About Me</label><textarea rows="4" value={profileData.bio} onChange={(e) => setProfileData({...profileData, bio: e.target.value})} placeholder="Tell mentors about your career goals and what you want to learn..." className="w-full p-5 bg-slate-50 border-2 border-slate-200 rounded-2xl font-bold text-slate-900 focus:bg-white focus:border-blue-400 outline-none transition-all resize-none"></textarea></div>
                </div>
                <div className="pt-4 flex justify-end"><button type="submit" disabled={isSavingProfile} className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-lg shadow-blue-500/30 transition-all flex items-center hover:-translate-y-1 disabled:opacity-70">{isSavingProfile ? 'Saving...' : 'Save Changes'} <Save className="w-5 h-5 ml-2" /></button></div>
              </form>
            </div>
          )}
          {settingsTab === 'security' && (
            <div className="animate-in fade-in duration-500 space-y-8">
              <div><h4 className="text-2xl font-black text-slate-900 mb-1">Update Password</h4><p className="text-slate-500 font-medium text-sm">Ensure your account is using a long, random password to stay secure.</p></div>
              <form onSubmit={(e) => {e.preventDefault(); alert("Password changed successfully!");}} className="space-y-6 max-w-lg">
                <div className="space-y-2"><label className="text-xs font-black text-slate-400 uppercase tracking-widest">Current Password</label><div className="relative"><Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" /><input required type="password" placeholder="••••••••" className="w-full pl-14 pr-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl font-bold text-slate-900 focus:bg-white focus:border-blue-400 outline-none transition-all" /></div></div>
                <div className="space-y-2"><label className="text-xs font-black text-slate-400 uppercase tracking-widest">New Password</label><div className="relative"><Key className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" /><input required type="password" placeholder="••••••••" className="w-full pl-14 pr-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl font-bold text-slate-900 focus:bg-white focus:border-blue-400 outline-none transition-all" /></div></div>
                <div className="space-y-2"><label className="text-xs font-black text-slate-400 uppercase tracking-widest">Confirm New Password</label><div className="relative"><CheckCircle className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" /><input required type="password" placeholder="••••••••" className="w-full pl-14 pr-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl font-bold text-slate-900 focus:bg-white focus:border-blue-400 outline-none transition-all" /></div></div>
                <button type="submit" className="w-full py-4 bg-slate-900 hover:bg-black text-white font-black rounded-2xl shadow-lg transition-all flex items-center justify-center">Update Password</button>
              </form>
            </div>
          )}
          {settingsTab === 'notifications' && (
            <div className="animate-in fade-in duration-500 space-y-8">
              <div><h4 className="text-2xl font-black text-slate-900 mb-1">Notification Preferences</h4><p className="text-slate-500 font-medium text-sm">Choose what updates you want to receive.</p></div>
              <div className="space-y-4">
                <div onClick={() => setEmailNotif(!emailNotif)} className={`flex items-center justify-between p-5 bg-slate-50 border rounded-2xl cursor-pointer transition-colors ${emailNotif ? 'border-blue-200 shadow-sm' : 'border-slate-100'}`}><div className="flex items-center"><div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm mr-4"><Mail className={`w-6 h-6 ${emailNotif ? 'text-blue-500' : 'text-slate-400'}`}/></div><div><p className="font-black text-slate-900">Email Notifications</p><p className="text-xs font-bold text-slate-500 mt-0.5">Receive updates via email.</p></div></div><div className={`w-14 h-7 rounded-full relative shadow-inner transition-colors ${emailNotif ? 'bg-blue-600' : 'bg-slate-300'}`}><div className={`w-5 h-5 bg-white rounded-full absolute top-1 shadow-sm transition-all ${emailNotif ? 'right-1' : 'left-1'}`}></div></div></div>
                <div onClick={() => setPushNotif(!pushNotif)} className={`flex items-center justify-between p-5 bg-slate-50 border rounded-2xl cursor-pointer transition-colors ${pushNotif ? 'border-blue-200 shadow-sm' : 'border-slate-100'}`}><div className="flex items-center"><div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm mr-4"><Smartphone className={`w-6 h-6 ${pushNotif ? 'text-indigo-500' : 'text-slate-400'}`}/></div><div><p className="font-black text-slate-900">Push Notifications</p><p className="text-xs font-bold text-slate-500 mt-0.5">Get alerts directly on your device.</p></div></div><div className={`w-14 h-7 rounded-full relative shadow-inner transition-colors ${pushNotif ? 'bg-blue-600' : 'bg-slate-300'}`}><div className={`w-5 h-5 bg-white rounded-full absolute top-1 shadow-sm transition-all ${pushNotif ? 'right-1' : 'left-1'}`}></div></div></div>
                <div onClick={() => setMarketingNotif(!marketingNotif)} className={`flex items-center justify-between p-5 bg-slate-50 border rounded-2xl cursor-pointer transition-colors ${marketingNotif ? 'border-blue-200 shadow-sm' : 'border-slate-100'}`}><div className="flex items-center"><div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm mr-4"><Globe className={`w-6 h-6 ${marketingNotif ? 'text-emerald-500' : 'text-slate-400'}`}/></div><div><p className="font-black text-slate-900">Marketing Updates</p><p className="text-xs font-bold text-slate-500 mt-0.5">Receive news about events and offers.</p></div></div><div className={`w-14 h-7 rounded-full relative shadow-inner transition-colors ${marketingNotif ? 'bg-blue-600' : 'bg-slate-300'}`}><div className={`w-5 h-5 bg-white rounded-full absolute top-1 shadow-sm transition-all ${marketingNotif ? 'right-1' : 'left-1'}`}></div></div></div>
              </div>
            </div>
          )}
        </div>
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
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans text-slate-800 selection:bg-blue-100 selection:text-blue-900">
      
      {/* Top Global Navbar */}
      <div className="w-full z-[200] relative">
        <Navbar />
      </div>

      {/* Main Layout Container */}
      <div className="flex flex-1 w-full relative">

        {/* 🟢 PREMIUM SIDEBAR */}
        <aside className="fixed top-[84px] left-0 h-[calc(100vh-100px)] w-[260px] ml-6 bg-white/90 backdrop-blur-xl rounded-[2.5rem] hidden md:flex flex-col justify-between shadow-[0_10px_40px_rgba(0,0,0,0.04)] z-40 border border-white py-6">
          <div className="flex flex-col w-full">
            
            {/* 🔴 Used style objects instead of classes to prevent external CSS interference */}
            <div className="flex flex-col w-full px-5 gap-2 mt-4">
              <button 
                onClick={() => setActiveTab('dashboard')} 
                style={{ backgroundColor: activeTab === 'dashboard' ? '#1e3a8a' : 'transparent' }}
                className={`flex items-center w-full px-5 py-4 rounded-2xl text-sm font-bold transition-all border-none outline-none ${activeTab === 'dashboard' ? '!text-white shadow-md' : '!text-slate-500 hover:bg-blue-50 hover:text-blue-600'}`}
              >
                <LayoutDashboard className="w-5 h-5 mr-4 shrink-0" /> <span className="whitespace-nowrap">Dashboard</span>
              </button>
              
              <button 
                onClick={() => setActiveTab('schedule')} 
                style={{ backgroundColor: activeTab === 'schedule' ? '#1e3a8a' : 'transparent' }}
                className={`flex items-center w-full px-5 py-4 rounded-2xl text-sm font-bold transition-all border-none outline-none ${activeTab === 'schedule' ? '!text-white shadow-md' : '!text-slate-500 hover:bg-blue-50 hover:text-blue-600'}`}
              >
                <BookOpen className="w-5 h-5 mr-4 shrink-0" /> <span className="whitespace-nowrap">My Path</span>
              </button>
              
              <button 
                onClick={() => setActiveTab('mentors')} 
                style={{ backgroundColor: activeTab === 'mentors' ? '#1e3a8a' : 'transparent' }}
                className={`flex items-center w-full px-5 py-4 rounded-2xl text-sm font-bold transition-all border-none outline-none ${activeTab === 'mentors' ? '!text-white shadow-md' : '!text-slate-500 hover:bg-blue-50 hover:text-blue-600'}`}
              >
                <UserCheck className="w-5 h-5 mr-4 shrink-0" /> <span className="whitespace-nowrap">Mentors</span>
              </button>
              
              <button 
                onClick={() => setActiveTab('leaderboard')} 
                style={{ backgroundColor: activeTab === 'leaderboard' ? '#1e3a8a' : 'transparent' }}
                className={`flex items-center w-full px-5 py-4 rounded-2xl text-sm font-bold transition-all border-none outline-none ${activeTab === 'leaderboard' ? '!text-white shadow-md' : '!text-slate-500 hover:bg-blue-50 hover:text-blue-600'}`}
              >
                <Award className="w-5 h-5 mr-4 shrink-0" /> <span className="whitespace-nowrap">Rankings</span>
              </button>
              
              <button 
                onClick={() => setActiveTab('inbox')} 
                style={{ backgroundColor: activeTab === 'inbox' ? '#1e3a8a' : 'transparent' }}
                className={`flex justify-between items-center w-full px-5 py-4 rounded-2xl text-sm font-bold transition-all border-none outline-none ${activeTab === 'inbox' ? '!text-white shadow-md' : '!text-slate-500 hover:bg-blue-50 hover:text-blue-600'}`}
              >
                <span className="flex items-center whitespace-nowrap"><Inbox className="w-5 h-5 mr-4 shrink-0" /> Messages</span>
                {unreadRepliesCount > 0 && <span className={`text-[10px] px-2 py-0.5 rounded-full font-black shrink-0 ${activeTab === 'inbox' ? 'bg-white text-blue-600' : 'bg-rose-500 text-white animate-pulse'}`}>{unreadRepliesCount}</span>}
              </button>
              
              <button 
                onClick={() => setActiveTab('settings')} 
                style={{ backgroundColor: activeTab === 'settings' ? '#1e3a8a' : 'transparent' }}
                className={`flex items-center w-full px-5 py-4 rounded-2xl text-sm font-bold transition-all border-none outline-none ${activeTab === 'settings' ? '!text-white shadow-md' : '!text-slate-500 hover:bg-blue-50 hover:text-blue-600'}`}
              >
                <Settings className="w-5 h-5 mr-4 shrink-0" /> <span className="whitespace-nowrap">Settings</span>
              </button>
            </div>
          </div>
          
          <div className="p-6 w-full mt-auto">
            <button 
               onClick={handleLogout} 
               style={{ backgroundColor: '#f8fafc' }}
               className="flex items-center justify-center w-full px-5 py-4 text-sm !text-slate-500 hover:!text-rose-600 rounded-2xl font-bold transition-all border border-transparent outline-none"
            >
              <LogOut className="w-5 h-5 mr-3 shrink-0" /> <span className="whitespace-nowrap">Sign Out</span>
            </button>
          </div>
        </aside>

        <main className="flex-1 md:pl-[290px] flex flex-col w-full relative z-10 min-h-screen">
          <header className="h-28 flex items-center justify-between px-8 sticky top-[68px] z-30 bg-[#f8fafc]/90 backdrop-blur-md transition-all border-b border-slate-200/50 shadow-sm">
            <div className="relative w-[28rem] hidden sm:block group">
              <Search className="w-5 h-5 absolute left-5 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
              <input type="text" value={exploreSearch} onChange={handleGlobalSearch} placeholder="Search anything across the platform..." className="w-full pl-14 pr-4 py-4 bg-white border-2 border-transparent focus:border-blue-200 rounded-2xl outline-none text-sm font-bold text-slate-700 shadow-sm transition-all focus:shadow-md" />
            </div>
            
            <div className="flex items-center space-x-6 ml-auto">
              <div className="hidden lg:flex items-center px-5 py-3 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 rounded-2xl shadow-sm cursor-help hover:scale-105 transition-transform">
                <Flame className="w-5 h-5 text-orange-500 mr-2 animate-pulse" />
                <span className="text-sm font-black text-orange-700">5 Day Streak!</span>
              </div>

              <div className="relative">
                <button onClick={() => setShowNotifs(!showNotifs)} className={`relative p-4 transition-colors bg-white rounded-2xl shadow-sm border ${showNotifs ? 'text-blue-600 border-blue-200' : 'text-slate-400 border-slate-100 hover:border-blue-100'}`}>
                  <BellRing className="w-6 h-6" />
                  {unreadRepliesCount > 0 && <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-rose-500 rounded-full border-2 border-white animate-ping"></span>}
                  {unreadRepliesCount > 0 && <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-rose-500 rounded-full border-2 border-white"></span>}
                </button>
                
                {showNotifs && (
                  <div className="absolute top-16 right-0 w-80 bg-white rounded-[2rem] shadow-2xl border border-slate-100 p-5 z-50 animate-in slide-in-from-top-4">
                     <div className="flex items-center justify-between mb-4 px-2">
                       <h4 className="font-black text-slate-900 text-lg">Alerts</h4>
                       <button onClick={() => setShowNotifs(false)} className="text-xs text-blue-600 font-bold hover:underline">Close</button>
                     </div>
                     {unreadRepliesCount > 0 ? (
                       <div onClick={() => {setActiveTab('inbox'); setShowNotifs(false);}} className="p-4 bg-blue-50 rounded-2xl border border-blue-100 mb-3 cursor-pointer hover:bg-blue-100 transition-colors">
                          <p className="text-sm font-black text-blue-900 flex items-center"><MessageSquare className="w-4 h-4 mr-2"/> {unreadRepliesCount} New Mentor Replies!</p>
                          <p className="text-xs font-bold text-blue-600 mt-2 leading-relaxed">Click here to read your messages in the Inbox.</p>
                       </div>
                     ) : (
                       <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors">
                          <p className="text-sm font-black text-slate-800 flex items-center"><Sparkles className="w-4 h-4 mr-2 text-amber-500"/> Welcome to Kuppi Space!</p>
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
                       <button onClick={() => {setActiveTab('settings'); setShowProfile(false);}} className="w-full text-left px-4 py-3 rounded-xl text-slate-700 font-bold hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center text-sm">
                          <User className="w-4 h-4 mr-3" /> My Profile
                       </button>
                     </div>
                     <hr className="border-slate-100 mb-2" />
                     <button onClick={handleLogout} className="w-full text-left px-5 py-4 rounded-xl text-rose-600 font-black hover:bg-rose-50 transition-colors flex items-center text-sm">
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
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 sm:p-8 bg-[#0f172a]/90 backdrop-blur-2xl transition-all">
          <div className="bg-[#020617]/90 border border-blue-500/30 rounded-[3rem] w-full max-w-6xl h-[85vh] flex flex-col shadow-[0_0_100px_rgba(37,99,235,0.3)] overflow-hidden relative animate-in zoom-in-95 duration-300">
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-600/30 rounded-full mix-blend-screen filter blur-[120px] -z-10 animate-pulse"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-violet-600/20 rounded-full mix-blend-screen filter blur-[120px] -z-10 animate-pulse"></div>

            <div className="p-8 md:p-12 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 bg-white/5 relative z-10 backdrop-blur-md">
              <div className="text-left w-full md:w-auto">
                <h2 className="text-4xl md:text-5xl font-black text-white mb-2 flex items-center"><Compass className="w-10 h-10 mr-4 text-blue-400" /> Discover Classes</h2>
                <p className="text-blue-200 font-medium text-lg ml-14">Find the perfect expert and master your chosen skill.</p>
              </div>
              <button onClick={() => setIsExploreOpen(false)} className="absolute top-8 right-8 p-3 bg-white/10 hover:bg-rose-500 hover:text-white rounded-full text-blue-200 transition-colors"><X className="w-6 h-6" /></button>
              <div className="w-full md:w-96 relative group mt-4 md:mt-0">
                <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-blue-300 w-5 h-5 group-focus-within:text-white transition-colors" />
                <input type="text" value={exploreSearch} onChange={(e) => setExploreSearch(e.target.value)} placeholder="Search skills, topics..." className="w-full bg-black/50 border border-blue-500/50 rounded-2xl py-4 pl-14 pr-4 text-white placeholder-blue-300/70 focus:outline-none focus:border-blue-300 focus:bg-white/10 transition-all font-bold shadow-inner" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 md:p-12 no-scrollbar relative z-10">
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
                          <div className="flex justify-between text-xs font-black mb-3 text-blue-200 uppercase"><span>Capacity</span><span className={fillPercentage >= 100 ? 'text-rose-400' : 'text-white'}>{group.current_members.length} / {group.max_members}</span></div>
                          <div className="w-full bg-black/50 rounded-full h-2.5 mb-8 overflow-hidden border border-white/5"><div className={`h-full rounded-full transition-all duration-1000 ${fillPercentage >= 100 ? 'bg-rose-500' : 'bg-gradient-to-r from-blue-400 to-cyan-400'}`} style={{ width: `${fillPercentage}%` }}></div></div>
                          {isEnrolled ? (
                            <div className="flex space-x-3">
                              <a href={group.session_link} target="_blank" rel="noreferrer" className="flex-1 py-4 bg-rose-500 hover:bg-rose-400 text-white font-black rounded-2xl flex items-center justify-center transition-all shadow-lg text-sm"><Youtube className="w-5 h-5 mr-2" /> Watch</a>
                              {group.quiz_link && <a href={group.quiz_link} target="_blank" rel="noreferrer" className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl flex items-center justify-center transition-all shadow-lg text-sm"><Target className="w-5 h-5 mr-2" /> Exam</a>}
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
      )}

    </div>
  );
};

export default JuniorDashboard; 
import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { X, Send, Sparkles, BookOpen, Loader2, ChevronDown, Trash2 } from 'lucide-react';

const API = 'http://localhost:5001/api';

const authCfg = () => {
  const u = JSON.parse(localStorage.getItem('userInfo') || 'null');
  return { headers: { Authorization: `Bearer ${u?.token}` } };
};

// ── Suggested prompts shown before user types anything ─────────────────────
const SUGGESTIONS = [
  '📚 Find resources for database design',
  '⭐ What are the top rated resources?',
  '📝 Summarise the newest uploads',
  '🔍 Resources about React and JavaScript',
  '📖 Help me find something for my exam',
];

const ResourceAssistant = () => {
  const [open, setOpen]           = useState(false);
  const [messages, setMessages]   = useState([]);
  const [input, setInput]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [resources, setResources] = useState([]);
  const [pulse, setPulse]         = useState(true);

  const bottomRef  = useRef(null);
  const inputRef   = useRef(null);

  // ── Fetch resources once for context ─────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get(`${API}/resources?limit=100`, authCfg());
        setResources(res.data.data || []);
      } catch {
        // silently fail — assistant still works without resource context
      }
    };
    load();
    // Stop pulse after 8s
    const t = setTimeout(() => setPulse(false), 8000);
    return () => clearTimeout(t);
  }, []);

  // ── Scroll to bottom when messages update ────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // ── Focus input when chat opens ───────────────────────────────────────────
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  // ── Build system prompt with resource context ─────────────────────────────
  const buildSystemPrompt = () => {
    const user = JSON.parse(localStorage.getItem('userInfo') || 'null');
    const userName = user?.name || 'Student';
    const userRole = user?.role || 'STUDENT';

    let resourceContext = '';
    if (resources.length > 0) {
      const summary = resources.slice(0, 40).map((r, i) =>
        `${i + 1}. "${r.title}" | Type: ${r.resourceType || r.type || 'N/A'} | Module: ${r.moduleCode || 'N/A'} | Uploaded by: ${r.uploadedBy?.name || 'Unknown'} | Downloads: ${r.downloadCount || 0} | Rating: ${r.averageRating ? r.averageRating.toFixed(1) : 'No rating'} | Tags: ${(r.tags || []).join(', ') || 'none'}`
      ).join('\n');
      resourceContext = `\n\nCurrent platform resources (${resources.length} total):\n${summary}`;
    }

    return `You are a helpful academic resource assistant for SkillNest, a university learning platform. You help ${userName} (role: ${userRole}) find, understand and make the most of the platform's study resources.

Your capabilities:
- Recommend resources based on the student's needs
- Summarise what kinds of resources are available
- Help students find resources by module code, topic, or resource type
- Give study tips related to available content
- Answer questions about the resources on the platform

Guidelines:
- Be concise, friendly and encouraging
- When recommending resources, mention the title and module code
- If asked about something not in the resource list, be honest but still helpful
- Keep responses focused and under 150 words unless a detailed answer is genuinely needed
- Use emojis sparingly to keep the tone friendly${resourceContext}`;
  };

  // ── Send message to Anthropic API ─────────────────────────────────────────
  const sendMessage = async (text) => {
    if (!text.trim() || loading) return;

    const userMsg = { role: 'user', content: text.trim() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput('');
    setLoading(true);

    try {
      const info = JSON.parse(localStorage.getItem('userInfo') || 'null');
      const response = await fetch('http://localhost:5001/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${info?.token}`,
        },
        body: JSON.stringify({
          system: buildSystemPrompt(),
          messages: updated.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await response.json();
      const reply = data.content?.[0]?.text || (data.message === 'The AI is a bit busy. Please wait 30 seconds and try again.' 
      ? '⏳ The AI is a bit busy right now. Please wait 30 seconds and try again.'
      : "Sorry, I couldn't get a response. Please try again.");
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: "⚠️ Connection error. Please check your network and try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleSuggestion = (s) => {
    sendMessage(s.replace(/^[^\w]*/, '').trim());
  };

  const clearChat = () => setMessages([]);

  return (
    <>
      {/* ── Floating Button ─────────────────────────────────────────────── */}
      <div className="fixed bottom-6 right-6 z-[500] flex flex-col items-end gap-3">

        {/* Tooltip label — shown when not open */}
        {!open && (
          <div className="bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-300">
            Ask AI Assistant ✨
          </div>
        )}

        <button
          onClick={() => setOpen((v) => !v)}
          className="relative w-14 h-14 rounded-2xl shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #2563eb 100%)' }}
          title="Resource AI Assistant"
        >
          {/* Pulse ring */}
          {pulse && !open && (
            <span className="absolute inset-0 rounded-2xl bg-indigo-400 animate-ping opacity-30" />
          )}

          {open ? (
            <ChevronDown className="w-6 h-6 text-white" />
          ) : (
            <Sparkles className="w-6 h-6 text-white" />
          )}

          {/* Unread dot — shown when chat is closed and resources loaded */}
          {!open && resources.length > 0 && messages.length === 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white flex items-center justify-center">
              <span className="text-[8px] font-black text-white">{resources.length > 99 ? '99+' : resources.length}</span>
            </span>
          )}
        </button>
      </div>

      {/* ── Chat Panel ──────────────────────────────────────────────────── */}
      <div
        className={`fixed bottom-24 right-6 z-[499] w-[360px] max-w-[calc(100vw-24px)] transition-all duration-300 origin-bottom-right
          ${open ? 'scale-100 opacity-100 pointer-events-auto' : 'scale-95 opacity-0 pointer-events-none'}`}
      >
        <div className="bg-white rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden flex flex-col"
          style={{ height: '520px' }}>

          {/* Header */}
          <div className="relative p-5 flex-shrink-0 overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #1e3a8a 100%)' }}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-400 rounded-full mix-blend-screen filter blur-[40px] opacity-30" />
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center border border-white/20">
                  <Sparkles className="w-5 h-5 text-indigo-200" />
                </div>
                <div>
                  <p className="text-white font-black text-sm leading-tight">Resource Assistant</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                    <p className="text-indigo-300 text-[10px] font-bold">
                      {resources.length > 0 ? `${resources.length} resources loaded` : 'Online'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {messages.length > 0 && (
                  <button onClick={clearChat} title="Clear chat"
                    className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
                    <Trash2 className="w-3.5 h-3.5 text-indigo-200" />
                  </button>
                )}
                <button onClick={() => setOpen(false)}
                  className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
                  <X className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F8FAFC]" style={{ scrollbarWidth: 'thin' }}>

            {/* Welcome state */}
            {messages.length === 0 && (
              <div className="space-y-4">
                <div className="bg-white rounded-2xl rounded-tl-sm p-4 shadow-sm border border-slate-100 max-w-[85%]">
                  <p className="text-slate-700 text-sm font-medium leading-relaxed">
                    👋 Hi! I'm your SkillNest Resource Assistant.
                    {resources.length > 0
                      ? ` I know about all ${resources.length} resources on the platform. How can I help you today?`
                      : ' How can I help you today?'}
                  </p>
                </div>

                {/* Suggestion chips */}
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Try asking:</p>
                  {SUGGESTIONS.map((s) => (
                    <button key={s} onClick={() => handleSuggestion(s)}
                      className="w-full text-left text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 rounded-xl px-4 py-2.5 transition-colors leading-snug">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Conversation */}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center mr-2 mt-1 shrink-0 shadow-sm">
                    <Sparkles className="w-3 h-3 text-white" />
                  </div>
                )}
                <div className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm font-medium leading-relaxed shadow-sm
                  ${msg.role === 'user'
                    ? 'bg-gradient-to-br from-indigo-600 to-blue-600 text-white rounded-tr-sm'
                    : 'bg-white text-slate-700 border border-slate-100 rounded-tl-sm'}`}>
                  {msg.content.split('\n').map((line, j) => (
                    <span key={j}>{line}{j < msg.content.split('\n').length - 1 && <br />}</span>
                  ))}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="flex justify-start">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center mr-2 mt-1 shrink-0 shadow-sm">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
                <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-3 bg-white border-t border-slate-100 flex-shrink-0">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about resources..."
                  disabled={loading}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 focus:border-indigo-400 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:bg-white transition-all placeholder-slate-400 disabled:opacity-50"
                />
              </div>
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95 shrink-0"
                style={{ background: 'linear-gradient(135deg, #4f46e5, #2563eb)' }}
              >
                {loading
                  ? <Loader2 className="w-4 h-4 text-white animate-spin" />
                  : <Send className="w-4 h-4 text-white" />}
              </button>
            </form>
            <p className="text-[9px] text-slate-400 font-bold text-center mt-2 uppercase tracking-widest">
              Powered by Gemini AI · SkillNest
            </p>
          </div>

        </div>
      </div>
    </>
  );
};

export default ResourceAssistant;

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, Link } from '../router/RouterContext';
import {
  Sparkles,
  Send,
  Bot,
  User,
  GraduationCap,
  Play,
  PhoneCall,
  BookOpen,
  ArrowRight,
  RotateCcw,
  Download,
  Copy,
  CheckCircle2,
  Layers,
  HelpCircle,
  Lightbulb,
  ExternalLink,
  ShieldCheck,
  Cpu,
  Brain
} from 'lucide-react';
import { qwenAiService, ChatMessage, QWEN_QUICK_PROMPTS } from '../services/qwenAiService';
import { StudentRegistrationModal } from '../components/common/StudentRegistrationModal';
import { VideoPlayerModal } from '../components/common/VideoPlayerModal';
import { youtubeVideoService, ExtendedYouTubeVideo } from '../services/youtubeVideoService';

export const ChatbotPage: React.FC = () => {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  // Modals
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);
  const [regModalData, setRegModalData] = useState({ title: '', id: '', category: '' });
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<ExtendedYouTubeVideo | null>(null);
  const [videoPlaylist, setVideoPlaylist] = useState<ExtendedYouTubeVideo[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loaded = qwenAiService.getStoredMessages();
    setMessages(loaded);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isTyping) return;

    const userMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toISOString()
    };

    const updated = [...messages, userMsg];
    setMessages(updated);
    setInputValue('');
    setIsTyping(true);

    try {
      const botResponse = await qwenAiService.generateResponse(text);
      const withResponse = [...updated, botResponse];
      setMessages(withResponse);
      qwenAiService.saveMessages(withResponse);
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearHistory = () => {
    qwenAiService.clearHistory();
    setMessages(qwenAiService.getStoredMessages());
    setConfirmClear(false);
  };

  const handleExportChat = () => {
    const exportText = messages
      .map((m) => `[${m.timestamp.slice(11, 19)}] ${m.sender.toUpperCase()}:\n${m.text}\n`)
      .join('\n---\n\n');
    const blob = new Blob([exportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quinn_ai_transcript_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleTriggerAction = (prompt: NonNullable<ChatMessage['actionPrompt']>) => {
    if (prompt.type === 'expert_call' || prompt.type === 'apply') {
      setRegModalData({
        title: prompt.payload || 'OpenFrame Education Academic Counseling Track',
        id: 'OF-COUNSEL-AI',
        category: 'Admissions'
      });
      setIsRegModalOpen(true);
    } else if (prompt.type === 'learn') {
      const vids = youtubeVideoService.getAllLibrary();
      setSelectedVideo(vids[0] || null);
      setVideoPlaylist(vids);
      setIsVideoModalOpen(true);
    } else if (prompt.type === 'browse_courses') {
      router.navigate('/marketplace');
    }
  };

  const handlePlayVideoItem = (vid: ExtendedYouTubeVideo) => {
    setSelectedVideo(vid);
    setVideoPlaylist([vid, ...youtubeVideoService.getAllLibrary()]);
    setIsVideoModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col font-sans">
      {/* Top Corporate Banner */}
      <div className="bg-slate-950 border-b border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <div className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
              OpenFrame Dedicated Academic Intelligence
            </div>
            <h1 className="text-base sm:text-lg font-extrabold text-white leading-tight">
              Quinn AI • Personal AI Course Tutor &amp; Career Assistant
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportChat}
            className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
            title="Export Transcript"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
          {confirmClear ? (
            <div className="flex items-center space-x-1.5">
              <button
                type="button"
                onClick={handleClearHistory}
                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Confirm Reset
              </button>
              <button
                type="button"
                onClick={() => setConfirmClear(false)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmClear(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/80 hover:text-rose-300 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
              title="Reset Chat"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
          <Link
            to="/marketplace"
            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-sm flex items-center space-x-1"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">15,500 Courses</span>
          </Link>
        </div>
      </div>

      {/* Main Grid: Sidebar + Chat Area */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-2 sm:px-6 py-4 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch overflow-hidden">
        {/* Left Sidebar: Quick Prompts & Knowledge Insights */}
        <aside className="hidden lg:flex lg:col-span-4 flex-col space-y-4 text-left">
          {/* Status Box */}
          <div className="bg-slate-950/90 rounded-2xl p-5 border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Knowledge Context</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-950 text-cyan-300 border border-blue-800">
                15,500 Courses
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Quinn AI provides authoritative guidance across OpenFrame&apos;s 15,500-course catalog, 110+ learning categories, corporate role training, IT solutions, and expert phone counseling.
            </p>

            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-cyan-400 font-bold">15,500</div>
                <div className="text-slate-400 text-[10px]">Cataloged Courses</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-cyan-400 font-bold">110+ Cats</div>
                <div className="text-slate-400 text-[10px]">AI, Corp, STEM</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-cyan-400 font-bold">1-on-1 Call</div>
                <div className="text-slate-400 text-[10px]">Academic Counseling</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-cyan-400 font-bold">HopeNest</div>
                <div className="text-slate-400 text-[10px]">Scholarships</div>
              </div>
            </div>
          </div>

          {/* Quick Prompts List */}
          <div className="flex-1 bg-slate-950/90 rounded-2xl p-5 border border-slate-800 shadow-xl flex flex-col space-y-3 overflow-hidden">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              <span>Recommended Prompts</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {QWEN_QUICK_PROMPTS.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(item.prompt)}
                  className="w-full p-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/40 text-left transition-all cursor-pointer group"
                >
                  <div className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors flex items-center justify-between">
                    <span>{item.label}</span>
                    <ArrowRight className="w-3 h-3 text-slate-500 group-hover:translate-x-0.5 group-hover:text-cyan-400 transition-transform" />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {item.prompt}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Right Chat Column (lg:col-span-8) */}
        <main className="lg:col-span-8 bg-slate-950/90 rounded-2xl border border-slate-800 shadow-2xl flex flex-col overflow-hidden h-[82vh]">
          {/* Chat Messages Log */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
            {messages.map((msg) => {
              const isQwen = msg.sender === 'qwen';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start space-x-3 text-left ${
                    isQwen ? 'justify-start' : 'justify-end flex-row-reverse space-x-reverse'
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
                      isQwen
                        ? 'bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 text-white'
                        : 'bg-slate-800 text-cyan-300 border border-slate-700'
                    }`}
                  >
                    {isQwen ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>

                  {/* Bubble */}
                  <div
                    className={`max-w-2xl rounded-2xl p-4 sm:p-5 space-y-3 text-xs leading-relaxed ${
                      isQwen
                        ? 'bg-slate-900/90 border border-slate-800 text-slate-200'
                        : 'bg-blue-600 text-white shadow-md'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4 pb-1 border-b border-white/10 text-[10px] text-slate-400">
                      <span className="font-semibold text-cyan-400">
                        {isQwen ? 'Quinn AI (Personal Course Tutor)' : 'You'}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span>{msg.timestamp.slice(11, 16)}</span>
                        {isQwen && (
                          <button
                            onClick={() => handleCopyMessage(msg.id, msg.text)}
                            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                            title="Copy text"
                          >
                            {copiedId === msg.id ? (
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Markdown Formatted Text */}
                    <div className="whitespace-pre-line space-y-2">
                      {msg.text}
                    </div>

                    {/* Course Suggestions Card Widget */}
                    {msg.courseSuggestions && msg.courseSuggestions.length > 0 && (
                      <div className="pt-2 space-y-2">
                        <div className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider">
                          Recommended Courses from 15,500 Catalog:
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {msg.courseSuggestions.map((c) => (
                            <div
                              key={c.id}
                              className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between space-y-2"
                            >
                              <div className="space-y-1">
                                <span className="text-[10px] font-mono font-bold text-cyan-400">
                                  {c.id}
                                </span>
                                <h4 className="font-bold text-white text-xs line-clamp-2">
                                  {c.title}
                                </h4>
                                <div className="text-[10px] text-slate-400 flex items-center space-x-2">
                                  <span>{c.category}</span>
                                  <span>•</span>
                                  <span>{c.duration}</span>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-1.5 pt-1">
                                <button
                                  onClick={() => {
                                    setRegModalData({
                                      title: c.title,
                                      id: c.id,
                                      category: c.category
                                    });
                                    setIsRegModalOpen(true);
                                  }}
                                  className="py-1 px-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] text-center cursor-pointer"
                                >
                                  Apply Now
                                </button>
                                <Link
                                  to={`/marketplace/${c.id}`}
                                  className="py-1 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold text-[10px] text-center"
                                >
                                  Details
                                </Link>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Video Suggestions Widget */}
                    {msg.videoSuggestions && msg.videoSuggestions.length > 0 && (
                      <div className="pt-2 space-y-2">
                        <div className="text-[11px] font-bold text-sky-400 uppercase tracking-wider flex items-center space-x-1">
                          <Play className="w-3 h-3 fill-sky-400" />
                          <span>Curated Educational Lectures:</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {msg.videoSuggestions.map((vid, vIdx) => (
                            <div
                              key={vid.id || vIdx}
                              onClick={() => handlePlayVideoItem(vid)}
                              className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900 transition-all cursor-pointer flex items-center space-x-2.5 group"
                            >
                              <div className="relative w-16 h-10 rounded-lg overflow-hidden bg-black shrink-0">
                                <img
                                  src={vid.thumbnail || vid.thumbnailUrl}
                                  alt={vid.title}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                  <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                                    <Play className="w-2.5 h-2.5 fill-white ml-0.5" />
                                  </div>
                                </div>
                              </div>
                              <div className="flex-1 min-w-0 text-left">
                                <div className="text-[10px] font-bold text-slate-400 truncate">
                                  {vid.channelTitle}
                                </div>
                                <div className="text-[11px] font-bold text-white truncate group-hover:text-cyan-300">
                                  {vid.title}
                                </div>
                                <div className="text-[9px] text-cyan-400">Play on Site ({vid.duration})</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Prompt Trigger */}
                    {msg.actionPrompt && (
                      <div className="pt-2 border-t border-slate-800/80">
                        <button
                          onClick={() => handleTriggerAction(msg.actionPrompt!)}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-1.5 cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
                          <span>{msg.actionPrompt.label}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-center space-x-3 text-left">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-slate-400">
                  <span>Quinn AI is analyzing curriculum &amp; synthesizing guidance...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Box Footer */}
          <div className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center space-x-2"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask Quinn AI about 15,500+ courses, roadmaps, Excel formulas, coding, or IT solutions..."
                className="flex-1 px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
              />

              <button
                type="submit"
                disabled={!inputValue.trim() || isTyping}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 px-1">
              <span>Quinn AI provides verified OpenFrame academic &amp; enterprise guidance.</span>
              <span className="hidden sm:inline">Press Enter to send</span>
            </div>
          </div>
        </main>
      </div>

      {/* STUDENT REGISTRATION POP-UP MODAL */}
      <StudentRegistrationModal
        isOpen={isRegModalOpen}
        onClose={() => setIsRegModalOpen(false)}
        courseTitle={regModalData.title}
        courseId={regModalData.id}
        courseCategory={regModalData.category}
      />

      {/* "PLAY ON MY SITE" YOUTUBE VIDEO POP-UP MODAL */}
      <VideoPlayerModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        video={selectedVideo}
        playlist={videoPlaylist}
        onSelectVideo={(vid) => setSelectedVideo(vid)}
        onApplyForCourse={(title, cat) => {
          setIsVideoModalOpen(false);
          setRegModalData({ title, id: 'VIDEO-QWEN-REF', category: cat });
          setIsRegModalOpen(true);
        }}
      />
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from '../../router/RouterContext';
import {
  Bot,
  X,
  Send,
  Maximize2,
  Sparkles,
  User,
  GraduationCap,
  Play,
  RotateCcw,
  ExternalLink,
  Brain
} from 'lucide-react';
import { qwenAiService, ChatMessage } from '../../services/qwenAiService';
import { StudentRegistrationModal } from './StudentRegistrationModal';
import { VideoPlayerModal } from './VideoPlayerModal';
import { youtubeVideoService, ExtendedYouTubeVideo } from '../../services/youtubeVideoService';

export const GlobalChatbotWidget: React.FC = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  // Modals inside widget
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);
  const [regTitle, setRegTitle] = useState('OpenFrame Education Academic Consultation');
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<ExtendedYouTubeVideo | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Do not render on the dedicated full-page /chatbot route to avoid duplication
  const cleanWidgetPath = router.currentPath.split('?')[0] || '/';
  const isDedicatedChatPage =
    cleanWidgetPath === '/chatbot' ||
    cleanWidgetPath === '/qwen-ai' ||
    cleanWidgetPath === '/quinn-ai' ||
    cleanWidgetPath === '/ai-assistant';

  useEffect(() => {
    const loaded = qwenAiService.getStoredMessages();
    setMessages(loaded);
  }, []);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      setHasUnread(false);
    }
  }, [messages, isOpen, isTyping]);

  if (isDedicatedChatPage) {
    return null;
  }

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

  const handleTriggerAction = (prompt: NonNullable<ChatMessage['actionPrompt']>) => {
    if (prompt.type === 'expert_call' || prompt.type === 'apply') {
      setRegTitle(prompt.payload || 'OpenFrame Education Counseling');
      setIsRegModalOpen(true);
    } else if (prompt.type === 'learn') {
      const vids = youtubeVideoService.getAllLibrary();
      setSelectedVideo(vids[0] || null);
      setIsVideoModalOpen(true);
    } else if (prompt.type === 'browse_courses') {
      router.navigate('/marketplace');
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* FLOATING LAUNCHER BUTTON */}
      {!isOpen && (
        <div className="fixed bottom-5 right-5 z-40 flex items-center group">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="w-11 h-11 rounded-full p-2 flex items-center justify-center bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-lg shadow-cyan-500/25 hover:scale-105 active:scale-95 transition-all duration-200 border border-white/25 cursor-pointer"
            aria-label="Open Quinn AI Chatbot"
            title="Ask Quinn AI"
          >
            <img
              src="/assets/aistudio/quinn-ai-logo.png"
              alt="Quinn AI"
              className="w-7 h-7 object-contain brightness-0 invert pointer-events-none select-none"
            />
          </button>
        </div>
      )}

      {/* EXPANDED FLOATING CHAT WINDOW */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 z-40 w-[92vw] sm:w-[400px] h-[550px] max-h-[85vh] bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700/80 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-md">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-white flex items-center space-x-1.5">
                  <span>Quinn AI</span>
                </div>
                <div className="text-[10px] text-cyan-400">
                  Personal AI Course Tutor &amp; Career Advisor
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={() => {
                  setIsOpen(false);
                  router.navigate('/chatbot');
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title="Open Dedicated Full Page"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Trigger Chips */}
          <div className="px-3 py-2 bg-slate-950/60 border-b border-slate-800 flex items-center space-x-1.5 overflow-x-auto no-scrollbar text-[11px] shrink-0">
            <button
              onClick={() => handleSendMessage('Which courses are best for beginners across the 15,500 catalog?')}
              className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-blue-900/60 text-slate-300 hover:text-cyan-300 border border-slate-700 whitespace-nowrap transition-colors cursor-pointer"
            >
              15,500 Courses
            </button>
            <button
              onClick={() => handleSendMessage('How does course pricing and 1-on-1 counseling work?')}
              className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-blue-900/60 text-slate-300 hover:text-cyan-300 border border-slate-700 whitespace-nowrap transition-colors cursor-pointer"
            >
              Fee & Expert Call
            </button>
            <button
              onClick={() => handleSendMessage('Show me top YouTube video lectures from MIT and Stanford')}
              className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-blue-900/60 text-slate-300 hover:text-cyan-300 border border-slate-700 whitespace-nowrap transition-colors cursor-pointer"
            >
              Watch Lectures
            </button>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
            {messages.map((msg) => {
              const isQwen = msg.sender === 'qwen';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start space-x-2 text-left ${
                    isQwen ? 'justify-start' : 'justify-end flex-row-reverse space-x-reverse'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 text-[10px] ${
                      isQwen ? 'bg-cyan-600 text-white font-bold' : 'bg-slate-700 text-slate-200'
                    }`}
                  >
                    {isQwen ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                  </div>

                  <div
                    className={`max-w-[85%] rounded-xl p-3 space-y-2 leading-relaxed ${
                      isQwen ? 'bg-slate-800/90 text-slate-200 border border-slate-700/60' : 'bg-blue-600 text-white'
                    }`}
                  >
                    <div className="whitespace-pre-line text-[11px] leading-relaxed">
                      {msg.text}
                    </div>

                    {msg.actionPrompt && (
                      <div className="pt-1.5 border-t border-white/10">
                        <button
                          onClick={() => handleTriggerAction(msg.actionPrompt!)}
                          className="w-full py-1.5 px-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-[10px] shadow transition-all cursor-pointer text-center"
                        >
                          {msg.actionPrompt.label}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-center space-x-2 text-slate-400 text-xs">
                <span>Quinn AI is thinking...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div className="p-2.5 bg-slate-950 border-t border-slate-800 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center space-x-1.5"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about courses, counseling, code..."
                className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isTyping}
                className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer disabled:opacity-50"
                aria-label="Send"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* REGISTRATION POP-UP MODAL */}
      <StudentRegistrationModal
        isOpen={isRegModalOpen}
        onClose={() => setIsRegModalOpen(false)}
        courseTitle={regTitle}
        courseId="OF-WIDGET-APPLY"
        courseCategory="Admissions"
      />

      {/* VIDEO POP-UP MODAL */}
      <VideoPlayerModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        video={selectedVideo}
        onApplyForCourse={(title, cat) => {
          setIsVideoModalOpen(false);
          setRegTitle(title);
          setIsRegModalOpen(true);
        }}
      />
    </>
  );
};

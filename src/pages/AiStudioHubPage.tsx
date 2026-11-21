import React, { useCallback, useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  MessageSquare,
  Mic,
  Send,
  Plus,
  Trash2,
  Loader2,
  AlertCircle,
  Brain,
  Sparkles,
  Square,
  Copy,
  Check,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { GoogleSignInButton } from '../components/common/GoogleSignInButton';
import { AudioTranscribePanel } from '../components/ai-studio/AudioTranscribePanel';
import {
  deleteSavedChatSession,
  fetchAiHistory,
  fetchChatSessionMessages,
  sendGeminiChat,
  transcribeAudio,
  type AiWorkspaceHistory,
  type ChatTurnMessage,
  type GeminiChatModelId,
  type GeminiPersonaId,
} from '../services/geminiStudioService';

type StudioTab = 'chat' | 'transcribe';

const CHAT_MODEL_OPTIONS: Array<{ id: GeminiChatModelId; label: string }> = [
  { id: 'gemini-3.1-flash-lite', label: 'Gemini 3.1 Flash Lite (Fast · Default)' },
  { id: 'gemini-4-hydrogen', label: 'Gemini 4 Hydrogen (Deep Tutor)' },
];

const CHAT_PERSONA_OPTIONS: Array<{ id: GeminiPersonaId; label: string }> = [
  { id: 'academic_tutor', label: 'Academic Tutor' },
  { id: 'career_mentor', label: 'Career Mentor' },
  { id: 'reasoning_architect', label: 'Systems & Math Architect' },
  { id: 'fast_assistant', label: 'Quick Study Helper' },
];

const STARTER_PROMPTS = [
  'Build a 6-week study roadmap for Python, SQL, and Web Development',
  'Explain dynamic programming vs greedy algorithms with clear worked examples',
  'Summarize CBSE Class 12 Physics wave optics formulas in a crisp revision sheet',
  'Create a 10-question practice quiz for Karnataka SSLC Mathematics',
];

export const AiStudioHubPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<StudioTab>('chat');

  const [messages, setMessages] = useState<ChatTurnMessage[]>([]);
  const [input, setInput] = useState('');
  const [model, setModel] = useState<GeminiChatModelId>('gemini-3.1-flash-lite');
  const [persona, setPersona] = useState<GeminiPersonaId>('academic_tutor');
  const [thinkingMode, setThinkingMode] = useState<'standard' | 'deep'>('standard');
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
  const [sending, setSending] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [quickRecording, setQuickRecording] = useState(false);
  const [quickTranscribing, setQuickTranscribing] = useState(false);
  const quickRecorderRef = useRef<MediaRecorder | null>(null);
  const quickChunksRef = useRef<Blob[]>([]);

  const [history, setHistory] = useState<AiWorkspaceHistory>({
    sessions: [],
    transcriptions: [],
  });
  const [loadingSession, setLoadingSession] = useState(false);

  const threadEndRef = useRef<HTMLDivElement>(null);

  const loadWorkspaceHistory = useCallback(async () => {
    if (!currentUser) {
      setHistory({ sessions: [], transcriptions: [] });
      return;
    }
    try {
      const data = await fetchAiHistory();
      setHistory(data);
    } catch {
      // Keep workspace usable even if history fetch is temporarily unavailable
    }
  }, [currentUser]);

  useEffect(() => {
    loadWorkspaceHistory();
  }, [loadWorkspaceHistory]);

  useEffect(() => {
    if (activeTab === 'chat') {
      threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, sending, activeTab]);

  const handleOpenSession = async (sessionId: number, sessionModel: string, sessionPersona: string) => {
    setLoadingSession(true);
    setChatError(null);
    try {
      const res = await fetchChatSessionMessages(sessionId);
      setActiveSessionId(sessionId);
      if (sessionModel === 'gemini-4-hydrogen' || sessionModel === 'gemini-3.1-flash-lite') {
        setModel(sessionModel);
      }
      if (
        sessionPersona === 'academic_tutor' ||
        sessionPersona === 'career_mentor' ||
        sessionPersona === 'reasoning_architect' ||
        sessionPersona === 'fast_assistant'
      ) {
        setPersona(sessionPersona);
      }
      setMessages(
        res.messages.map((m) => ({
          id: `sql-${m.id}`,
          role: m.role,
          text: m.content,
          modelUsed: m.modelUsed || undefined,
          createdAt: m.createdAt,
        }))
      );
    } catch (err: any) {
      setChatError(err?.message || 'Unable to load conversation.');
    } finally {
      setLoadingSession(false);
    }
  };

  const handleDeleteSession = async (sessionId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteSavedChatSession(sessionId);
      if (activeSessionId === sessionId) {
        setActiveSessionId(null);
        setMessages([]);
      }
      loadWorkspaceHistory();
    } catch (err: any) {
      setChatError(err?.message || 'Unable to delete session.');
    }
  };

  const handleNewChat = () => {
    setActiveSessionId(null);
    setMessages([]);
    setChatError(null);
  };

  const handleSendChat = async (overrideText?: string) => {
    const clean = (overrideText ?? input).trim();
    if (!clean || sending) return;

    const userTurn: ChatTurnMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: clean,
      createdAt: new Date().toISOString(),
    };

    const nextMessages = [...messages, userTurn];
    setMessages(nextMessages);
    setInput('');
    setChatError(null);
    setSending(true);

    try {
      const res = await sendGeminiChat({
        messages: nextMessages.map((m) => ({ role: m.role, text: m.text })),
        model,
        persona,
        thinkingMode,
        sessionId: activeSessionId,
      });

      const modelTurn: ChatTurnMessage = {
        id: `model-${Date.now()}`,
        role: 'model',
        text: res.reply,
        modelUsed: res.model,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, modelTurn]);
      if (res.sessionId) {
        setActiveSessionId(res.sessionId);
        loadWorkspaceHistory();
      }
    } catch (err: any) {
      setChatError(err?.message || 'Unable to get a response from Gemini.');
    } finally {
      setSending(false);
    }
  };

  const toggleQuickDictation = async () => {
    if (quickRecording) {
      quickRecorderRef.current?.stop();
      setQuickRecording(false);
      return;
    }

    setChatError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      quickChunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) quickChunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const mime = recorder.mimeType || 'audio/webm';
        const blob = new Blob(quickChunksRef.current, { type: mime });
        if (blob.size === 0) return;
        setQuickTranscribing(true);
        try {
          const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(typeof reader.result === 'string' ? reader.result : '');
            reader.onerror = () => reject(new Error('Failed to encode audio.'));
            reader.readAsDataURL(blob);
          });
          const res = await transcribeAudio({ audioBase64: base64, mimeType: mime });
          if (res.transcript && res.transcript !== '[No speech detected]') {
            setInput((prev) => (prev ? `${prev} ${res.transcript}` : res.transcript));
            loadWorkspaceHistory();
          }
        } catch (err: any) {
          setChatError(err?.message || 'Voice dictation transcription failed.');
        } finally {
          setQuickTranscribing(false);
        }
      };
      quickRecorderRef.current = recorder;
      recorder.start();
      setQuickRecording(true);
    } catch (err: any) {
      setChatError(
        err?.name === 'NotAllowedError'
          ? 'Microphone permission was denied.'
          : err?.message || 'Could not access microphone.'
      );
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1600);
  };

  const TABS: Array<{ id: StudioTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'chat', label: 'Gemini Chat', icon: MessageSquare },
    { id: 'transcribe', label: 'Audio Transcribe', icon: Mic },
  ];

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#18221F] pb-16">
      <section className="border-b border-slate-200/80 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#123D32]">
                OpenFrame AI Studio
              </p>
              <h1 className="font-editorial text-3xl sm:text-4xl font-semibold text-[#18221F] mt-1 tracking-tight">
                AI Tutor &amp; Audio Transcription
              </h1>
              <p className="text-sm text-slate-600 mt-1.5 max-w-2xl">
                Chat with Gemini across saved multi-turn study threads and transcribe microphone recordings or lecture audio with automatic cloud history.
              </p>
            </div>

            {!currentUser && (
              <div className="flex items-center gap-3 bg-[#FAF7F2] border border-slate-200 rounded-xl px-4 py-2.5 shrink-0">
                <div className="text-xs text-slate-600">
                  <div className="font-semibold text-[#18221F]">Save your history</div>
                  <div>Sign in with Google to sync threads &amp; notes</div>
                </div>
                <GoogleSignInButton role="student" label="Sign In" variant="compact" />
              </div>
            )}
          </div>

          <div className="mt-6 flex items-center gap-1.5 overflow-x-auto pb-1">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-[#123D32] text-white shadow-xs'
                      : 'text-slate-700 hover:bg-[#FAF7F2] hover:text-[#18221F]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'chat' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <aside className="lg:col-span-4 space-y-4">
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-[#18221F] flex items-center gap-1.5">
                    <Brain className="w-4 h-4 text-[#123D32]" />
                    <span>Conversation Settings</span>
                  </h2>
                  <button
                    type="button"
                    onClick={handleNewChat}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#123D32] hover:bg-[#0e3027] text-white text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New Thread</span>
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Gemini Model
                  </label>
                  <select
                    value={model}
                    onChange={(e) => setModel(e.target.value as GeminiChatModelId)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-[#FAF7F2] text-xs font-medium text-[#18221F]"
                  >
                    {CHAT_MODEL_OPTIONS.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    System Persona
                  </label>
                  <select
                    value={persona}
                    onChange={(e) => setPersona(e.target.value as GeminiPersonaId)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-[#FAF7F2] text-xs font-medium text-[#18221F]"
                  >
                    {CHAT_PERSONA_OPTIONS.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Reasoning Depth
                  </label>
                  <select
                    value={thinkingMode}
                    onChange={(e) => setThinkingMode(e.target.value as 'standard' | 'deep')}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-[#FAF7F2] text-xs font-medium text-[#18221F]"
                  >
                    <option value="standard">Standard</option>
                    <option value="deep">Deep Thinking</option>
                  </select>
                </div>
              </div>

              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Saved Conversations
                </h3>
                {!currentUser ? (
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Sign in with Google above to automatically save and resume your multi-turn conversations across visits.
                  </p>
                ) : history.sessions.length === 0 ? (
                  <p className="text-xs text-slate-500">
                    Your conversations will appear here as soon as you send your first message.
                  </p>
                ) : (
                  <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                    {history.sessions.map((s) => (
                      <div
                        key={s.id}
                        onClick={() => handleOpenSession(s.id, s.model, s.persona)}
                        className={`p-3 rounded-xl border transition-colors cursor-pointer flex items-center justify-between gap-2 ${
                          activeSessionId === s.id
                            ? 'bg-[#123D32]/8 border-[#123D32]/40'
                            : 'bg-[#FAF7F2]/60 border-slate-200/70 hover:bg-[#FAF7F2]'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-[#18221F] truncate">
                            {s.title}
                          </div>
                          <div className="text-[11px] text-slate-500 truncate mt-0.5">
                            {s.model} · {new Date(s.updatedAt).toLocaleDateString('en-IN')}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteSession(s.id, e)}
                          title="Delete conversation"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 shrink-0 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </aside>

            <div className="lg:col-span-8 bg-white border border-slate-200/90 rounded-2xl flex flex-col overflow-hidden h-[72vh] min-h-[540px]">
              <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between gap-2">
                <div className="text-sm font-semibold text-[#18221F] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#123D32]" />
                  <span>Multi-Turn Gemini Thread</span>
                </div>
                <span className="text-xs text-slate-500 font-medium">{model}</span>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-[#FAF7F2]/40">
                {loadingSession ? (
                  <div className="h-full flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-[#123D32]" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center px-4 py-10 space-y-5">
                    <div className="max-w-md space-y-1.5">
                      <h3 className="font-editorial text-2xl font-semibold text-[#18221F]">
                        What would you like to learn today?
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600">
                        Ask questions, generate revision sheets, or tap the microphone to dictate your prompt.
                      </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-2xl text-left">
                      {STARTER_PROMPTS.map((prompt) => (
                        <button
                          key={prompt}
                          type="button"
                          onClick={() => handleSendChat(prompt)}
                          className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-[#123D32]/50 text-xs text-slate-700 hover:text-[#18221F] leading-relaxed transition-colors cursor-pointer"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${
                        msg.role === 'user' ? 'items-end' : 'items-start'
                      }`}
                    >
                      <div className="text-[11px] font-medium text-slate-500 mb-1 px-1 flex items-center gap-2">
                        <span>{msg.role === 'user' ? 'You' : msg.modelUsed || 'Gemini'}</span>
                        {msg.role === 'model' && (
                          <button
                            type="button"
                            onClick={() => handleCopy(msg.id, msg.text)}
                            className="inline-flex items-center gap-1 text-slate-400 hover:text-[#18221F] cursor-pointer"
                          >
                            {copiedId === msg.id ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        )}
                      </div>
                      <div
                        className={`max-w-[90%] sm:max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                          msg.role === 'user'
                            ? 'bg-[#123D32] text-white'
                            : 'bg-white border border-slate-200 text-[#18221F]'
                        }`}
                      >
                        {msg.role === 'user' ? (
                          <div className="whitespace-pre-wrap">{msg.text}</div>
                        ) : (
                          <div className="prose prose-sm max-w-none text-[#18221F] prose-a:text-[#2563EB]">
                            <ReactMarkdown>{msg.text}</ReactMarkdown>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}

                {sending && (
                  <div className="flex items-center gap-2 text-xs text-slate-600 px-1">
                    <Loader2 className="w-4 h-4 animate-spin text-[#123D32]" />
                    <span>Gemini is composing a response...</span>
                  </div>
                )}

                {chatError && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{chatError}</span>
                  </div>
                )}

                <div ref={threadEndRef} />
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendChat();
                }}
                className="p-3.5 border-t border-slate-200 bg-white flex items-center gap-2"
              >
                <button
                  type="button"
                  onClick={toggleQuickDictation}
                  disabled={sending || quickTranscribing}
                  title={quickRecording ? 'Stop recording' : 'Dictate prompt with microphone'}
                  className={`p-2.5 rounded-xl border transition-colors shrink-0 cursor-pointer ${
                    quickRecording
                      ? 'bg-rose-600 border-rose-600 text-white'
                      : 'bg-[#FAF7F2] border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {quickTranscribing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : quickRecording ? (
                    <Square className="w-4 h-4 fill-current" />
                  ) : (
                    <Mic className="w-4 h-4" />
                  )}
                </button>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask Gemini anything, or tap the mic to dictate..."
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-[#FAF7F2] text-sm text-[#18221F] focus:outline-none focus:ring-2 focus:ring-[#123D32]/30"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || sending}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#123D32] hover:bg-[#0e3027] text-white text-sm font-semibold transition-colors disabled:opacity-50 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <span>Send</span>
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'transcribe' && (
          <AudioTranscribePanel
            savedTranscriptions={history.transcriptions}
            onTranscriptionSaved={loadWorkspaceHistory}
            onSendToChat={(promptText) => {
              setActiveTab('chat');
              handleSendChat(promptText);
            }}
          />
        )}
      </div>
    </div>
  );
};

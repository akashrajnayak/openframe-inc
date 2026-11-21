import type { Express } from 'express';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { requireAuth, verifyOptionalAuth, type AuthenticatedRequest } from '../src/middleware/auth.ts';
import { getOrCreateUser } from '../src/db/users.ts';
import {
  appendChatTurn,
  deleteChatSession,
  getSessionMessages,
  listUserChatSessions,
  listUserTranscriptions,
  saveTranscription,
} from '../src/db/aiRepository.ts';

// Strictly verified working standard-tier models (no paid API key required)
const ALLOWED_CHAT_MODELS = new Set([
  'gemini-4-hydrogen',
  'gemini-3.1-flash-lite',
]);

const PERSONA_SYSTEM_PROMPTS: Record<string, string> = {
  academic_tutor:
    'You are Quinn AI, the academic tutor and learning mentor for OpenFrame Education (OpenFrame IT Solutions Private Limited, Hubballi, Karnataka — offering 22,529+ courses, LKG–Class 12 school programs, certifications, and digital learning tools). Explain concepts clearly with structured headings, practical examples, and step-by-step guidance.',
  career_mentor:
    'You are an OpenFrame Career & Skill Architect. Help learners design structured career roadmaps, portfolio projects, certification pathways, and interview preparation plans.',
  reasoning_architect:
    'You are a Principal Systems & Reasoning Engineer at OpenFrame IT Solutions. Break down complex mathematics, software architecture, algorithms, and engineering questions with rigorous logical verification.',
  fast_assistant:
    'You are a concise, high-speed study helper for OpenFrame Education (OpenFrame IT Solutions Private Limited, Hubballi, Karnataka). Give direct, accurate answers with clear bullet points and zero fluff.',
};

function getGeminiClient(): GoogleGenAI {
  const apiKey = (process.env.GEMINI_API_KEY || '').trim();
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured on the server.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function formatGeminiError(err: unknown): { status: number; message: string } {
  const raw = err instanceof Error ? err.message : String(err || 'Gemini request failed');
  const lower = raw.toLowerCase();

  if (lower.includes('429') || lower.includes('resource_exhausted') || lower.includes('rate limit')) {
    return {
      status: 429,
      message: 'Rate limit reached. Please wait a few seconds and try again.',
    };
  }
  if (lower.includes('503') || lower.includes('high demand') || lower.includes('unavailable')) {
    return {
      status: 503,
      message: 'The AI model is experiencing brief high demand. Please retry in a moment.',
    };
  }

  return {
    status: 502,
    message: raw.slice(0, 320),
  };
}

export function registerGeminiStudioRoutes(app: Express): void {
  // ------------------------------------------------------------------
  // 1. User Account Sync & Cloud SQL History Overview
  // ------------------------------------------------------------------
  app.get('/api/ai/history', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const user = req.user!;
      await getOrCreateUser({
        uid: user.uid,
        email: user.email,
        displayName: user.name,
        photoUrl: user.picture,
      });

      const [sessions, transcriptions] = await Promise.all([
        listUserChatSessions(user.uid),
        listUserTranscriptions(user.uid),
      ]);

      return res.json({
        ok: true,
        sessions,
        transcriptions,
      });
    } catch (err) {
      console.error('[api/ai/history] Error:', err);
      return res.status(500).json({ ok: false, error: 'Unable to load saved history.' });
    }
  });

  app.get('/api/ai/sessions/:sessionId', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const sessionId = Number(req.params.sessionId);
      if (!Number.isInteger(sessionId) || sessionId <= 0) {
        return res.status(400).json({ ok: false, error: 'Invalid session ID.' });
      }
      const messages = await getSessionMessages(req.user!.uid, sessionId);
      return res.json({ ok: true, sessionId, messages });
    } catch (err) {
      console.error('[api/ai/sessions/:id] Error:', err);
      return res.status(500).json({ ok: false, error: 'Unable to load chat session.' });
    }
  });

  app.delete('/api/ai/sessions/:sessionId', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const sessionId = Number(req.params.sessionId);
      if (!Number.isInteger(sessionId) || sessionId <= 0) {
        return res.status(400).json({ ok: false, error: 'Invalid session ID.' });
      }
      const deleted = await deleteChatSession(req.user!.uid, sessionId);
      return res.json({ ok: true, deleted });
    } catch (err) {
      console.error('[api/ai/sessions/:id DELETE] Error:', err);
      return res.status(500).json({ ok: false, error: 'Unable to delete chat session.' });
    }
  });

  // ------------------------------------------------------------------
  // 2. Multi-Turn Gemini Chatbot (Standard Tier Models Only)
  // ------------------------------------------------------------------
  app.post('/api/ai/chat', async (req: AuthenticatedRequest, res) => {
    try {
      const caller = await verifyOptionalAuth(req);
      const {
        messages,
        message,
        model = 'gemini-3.1-flash-lite',
        persona = 'academic_tutor',
        thinkingMode = 'standard',
        sessionId,
      } = req.body || {};

      let selectedModel = ALLOWED_CHAT_MODELS.has(String(model))
        ? String(model)
        : 'gemini-3.1-flash-lite';
      const selectedPersona = PERSONA_SYSTEM_PROMPTS[String(persona)]
        ? String(persona)
        : 'academic_tutor';

      const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

      if (Array.isArray(messages) && messages.length > 0) {
        const trimmed = messages.slice(-24);
        for (const item of trimmed) {
          const text = String(item?.text || item?.content || '').trim();
          if (!text) continue;
          const role: 'user' | 'model' =
            item?.role === 'model' || item?.sender === 'qwen' ? 'model' : 'user';
          contents.push({ role, parts: [{ text: text.slice(0, 12000) }] });
        }
      }

      const latestInput = String(message || '').trim();
      if (latestInput) {
        contents.push({ role: 'user', parts: [{ text: latestInput.slice(0, 12000) }] });
      }

      if (contents.length === 0) {
        return res.status(400).json({ ok: false, error: 'Please provide a message to send.' });
      }

      const ai = getGeminiClient();
      const buildConfig = (m: string) => {
        const cfg: Record<string, any> = {
          systemInstruction: PERSONA_SYSTEM_PROMPTS[selectedPersona],
        };
        if (thinkingMode === 'deep' && m === 'gemini-4-hydrogen') {
          cfg.thinkingConfig = {
            thinkingLevel: ThinkingLevel.HIGH,
          };
        }
        return cfg;
      };

      let response: any;
      try {
        response = await ai.models.generateContent({
          model: selectedModel,
          contents,
          config: buildConfig(selectedModel),
        });
      } catch (primaryErr: any) {
        // Automatic fallback to gemini-3.1-flash-lite if gemini-4-hydrogen has a transient 503 spike
        const msg = String(primaryErr?.message || '').toLowerCase();
        if (
          selectedModel === 'gemini-4-hydrogen' &&
          (msg.includes('503') || msg.includes('high demand') || msg.includes('unavailable'))
        ) {
          selectedModel = 'gemini-3.1-flash-lite';
          response = await ai.models.generateContent({
            model: selectedModel,
            contents,
            config: buildConfig(selectedModel),
          });
        } else {
          throw primaryErr;
        }
      }

      const replyText =
        (response.text || '').trim() || 'I could not generate a text response for that prompt.';

      let persistedSessionId: number | null =
        typeof sessionId === 'number' && Number.isInteger(sessionId) ? sessionId : null;

      if (caller) {
        try {
          await getOrCreateUser({
            uid: caller.uid,
            email: caller.email,
            displayName: caller.name,
            photoUrl: caller.picture,
          });
          const lastUserText =
            latestInput ||
            [...contents].reverse().find((c) => c.role === 'user')?.parts?.[0]?.text ||
            'Chat message';
          const saved = await appendChatTurn({
            userUid: caller.uid,
            sessionId: persistedSessionId,
            titleHint: lastUserText,
            model: selectedModel,
            persona: selectedPersona,
            userText: lastUserText,
            modelText: replyText,
          });
          if (saved) {
            persistedSessionId = saved.sessionId;
          }
        } catch (dbErr) {
          console.warn('[api/ai/chat] Non-fatal persistence error:', dbErr);
        }
      }

      return res.json({
        ok: true,
        reply: replyText,
        model: selectedModel,
        persona: selectedPersona,
        sessionId: persistedSessionId,
      });
    } catch (err) {
      const formatted = formatGeminiError(err);
      console.error('[api/ai/chat] Gemini error:', err);
      return res.status(formatted.status).json({
        ok: false,
        error: formatted.message,
      });
    }
  });

  // ------------------------------------------------------------------
  // 3. Audio Transcription (via standard-tier gemini-3.1-flash-lite multimodal audio)
  // ------------------------------------------------------------------
  app.post('/api/ai/transcribe', async (req: AuthenticatedRequest, res) => {
    try {
      const caller = await verifyOptionalAuth(req);
      const { audioBase64, mimeType = 'audio/webm', title, durationSeconds } = req.body || {};

      if (!audioBase64 || typeof audioBase64 !== 'string') {
        return res.status(400).json({ ok: false, error: 'Audio data is required for transcription.' });
      }

      const cleanedBase64 = audioBase64.replace(/^data:[^;]+;base64,/, '');
      if (!cleanedBase64 || cleanedBase64.length > 25_000_000) {
        return res.status(400).json({
          ok: false,
          error: 'Audio recording is empty or exceeds the maximum upload size (~18MB).',
        });
      }

      const safeMime =
        typeof mimeType === 'string' && mimeType.startsWith('audio/')
          ? mimeType.split(';')[0]
          : 'audio/webm';

      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: safeMime,
                data: cleanedBase64,
              },
            },
            {
              text: 'Transcribe the spoken words in this audio accurately. Return only the transcript text with natural punctuation. If the audio is silent or contains no speech, respond with "[No speech detected]".',
            },
          ],
        },
      });

      const transcript = (response.text || '').trim();
      if (!transcript) {
        return res.status(422).json({
          ok: false,
          error: 'No speech was detected in the recording. Please speak clearly and try again.',
        });
      }

      let savedRecord = null;
      if (caller && transcript !== '[No speech detected]') {
        try {
          await getOrCreateUser({
            uid: caller.uid,
            email: caller.email,
            displayName: caller.name,
            photoUrl: caller.picture,
          });
          savedRecord = await saveTranscription({
            userUid: caller.uid,
            title:
              typeof title === 'string' && title.trim()
                ? title.trim()
                : `Voice Note · ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`,
            transcript,
            mimeType: safeMime,
            durationSeconds:
              typeof durationSeconds === 'number' && Number.isFinite(durationSeconds)
                ? Math.max(0, Math.round(durationSeconds))
                : null,
          });
        } catch (dbErr) {
          console.warn('[api/ai/transcribe] Persistence warning:', dbErr);
        }
      }

      return res.json({
        ok: true,
        model: 'gemini-3.1-flash-lite',
        transcript,
        saved: savedRecord,
      });
    } catch (err) {
      const formatted = formatGeminiError(err);
      console.error('[api/ai/transcribe] Error:', err);
      return res.status(formatted.status).json({ ok: false, error: formatted.message });
    }
  });
}

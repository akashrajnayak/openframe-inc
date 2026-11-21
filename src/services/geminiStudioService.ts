import { auth } from './firebase';

export type GeminiChatModelId = 'gemini-4-hydrogen' | 'gemini-3.1-flash-lite';

export type GeminiPersonaId =
  | 'academic_tutor'
  | 'career_mentor'
  | 'reasoning_architect'
  | 'fast_assistant';

export interface ChatTurnMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  modelUsed?: string;
  createdAt: string;
}

export interface SavedChatSession {
  id: number;
  title: string;
  model: string;
  persona: string;
  createdAt: string;
  updatedAt: string;
}

export interface SavedTranscription {
  id: number;
  title: string;
  transcript: string;
  mimeType: string | null;
  durationSeconds: number | null;
  createdAt: string;
}

export interface AiWorkspaceHistory {
  sessions: SavedChatSession[];
  transcriptions: SavedTranscription[];
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  try {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }
  } catch {
    // Proceed unauthenticated if token fetch is unavailable
  }
  return headers;
}

async function parseJsonResponse<T>(resp: Response): Promise<T> {
  const data = await resp.json().catch(() => null);
  if (!resp.ok || !data || data.ok === false) {
    const msg =
      (data && typeof data.error === 'string' && data.error) ||
      `Request failed with status ${resp.status}`;
    throw new Error(msg);
  }
  return data as T;
}

export async function sendGeminiChat(payload: {
  messages: Array<{ role: 'user' | 'model'; text: string }>;
  model: GeminiChatModelId;
  persona: GeminiPersonaId;
  thinkingMode?: 'standard' | 'deep';
  sessionId?: number | null;
}): Promise<{
  reply: string;
  model: string;
  persona: string;
  sessionId: number | null;
}> {
  const headers = await getAuthHeaders();
  const resp = await fetch('/api/ai/chat', {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  return parseJsonResponse(resp);
}

export async function transcribeAudio(payload: {
  audioBase64: string;
  mimeType: string;
  title?: string;
  durationSeconds?: number;
}): Promise<{
  model: string;
  transcript: string;
  saved: SavedTranscription | null;
}> {
  const headers = await getAuthHeaders();
  const resp = await fetch('/api/ai/transcribe', {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  return parseJsonResponse(resp);
}

export async function fetchAiHistory(): Promise<AiWorkspaceHistory> {
  const headers = await getAuthHeaders();
  const resp = await fetch('/api/ai/history', {
    method: 'GET',
    headers,
  });
  return parseJsonResponse(resp);
}

export async function fetchChatSessionMessages(sessionId: number): Promise<{
  sessionId: number;
  messages: Array<{
    id: number;
    role: 'user' | 'model';
    content: string;
    modelUsed: string | null;
    createdAt: string;
  }>;
}> {
  const headers = await getAuthHeaders();
  const resp = await fetch(`/api/ai/sessions/${sessionId}`, {
    method: 'GET',
    headers,
  });
  return parseJsonResponse(resp);
}

export async function deleteSavedChatSession(sessionId: number): Promise<void> {
  const headers = await getAuthHeaders();
  const resp = await fetch(`/api/ai/sessions/${sessionId}`, {
    method: 'DELETE',
    headers,
  });
  await parseJsonResponse(resp);
}

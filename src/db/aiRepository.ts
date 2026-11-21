import { and, desc, eq } from 'drizzle-orm';
import { db, isSqlConfigured } from './index.ts';
import {
  aiChatSessions,
  aiChatMessages,
  aiTranscriptions,
  type AiChatSessionRecord,
  type AiChatMessageRecord,
  type AiTranscriptionRecord,
} from './schema.ts';

export async function listUserChatSessions(userUid: string): Promise<AiChatSessionRecord[]> {
  if (!isSqlConfigured()) return [];
  try {
    return await db
      .select()
      .from(aiChatSessions)
      .where(eq(aiChatSessions.userUid, userUid))
      .orderBy(desc(aiChatSessions.updatedAt))
      .limit(30);
  } catch (err) {
    console.error('[db/aiRepository] listUserChatSessions failed:', err);
    throw new Error('Unable to load saved chat sessions.');
  }
}

export async function createChatSession(params: {
  userUid: string;
  title: string;
  model: string;
  persona: string;
}): Promise<AiChatSessionRecord | null> {
  if (!isSqlConfigured()) return null;
  try {
    const [row] = await db
      .insert(aiChatSessions)
      .values({
        userUid: params.userUid,
        title: params.title.trim().slice(0, 140) || 'New Conversation',
        model: params.model.trim().slice(0, 80),
        persona: params.persona.trim().slice(0, 60),
      })
      .returning();
    return row || null;
  } catch (err) {
    console.error('[db/aiRepository] createChatSession failed:', err);
    throw new Error('Unable to create chat session.');
  }
}

export async function getSessionMessages(
  userUid: string,
  sessionId: number
): Promise<AiChatMessageRecord[]> {
  if (!isSqlConfigured()) return [];
  try {
    const [session] = await db
      .select({ id: aiChatSessions.id })
      .from(aiChatSessions)
      .where(and(eq(aiChatSessions.id, sessionId), eq(aiChatSessions.userUid, userUid)))
      .limit(1);

    if (!session) return [];

    return await db
      .select()
      .from(aiChatMessages)
      .where(eq(aiChatMessages.sessionId, sessionId))
      .orderBy(aiChatMessages.createdAt)
      .limit(200);
  } catch (err) {
    console.error('[db/aiRepository] getSessionMessages failed:', err);
    throw new Error('Unable to load conversation messages.');
  }
}

export async function appendChatTurn(params: {
  userUid: string;
  sessionId?: number | null;
  titleHint: string;
  model: string;
  persona: string;
  userText: string;
  modelText: string;
}): Promise<{ sessionId: number } | null> {
  if (!isSqlConfigured()) return null;
  try {
    let activeSessionId = params.sessionId ?? null;

    if (activeSessionId) {
      const [existing] = await db
        .select({ id: aiChatSessions.id })
        .from(aiChatSessions)
        .where(
          and(
            eq(aiChatSessions.id, activeSessionId),
            eq(aiChatSessions.userUid, params.userUid)
          )
        )
        .limit(1);
      if (!existing) {
        activeSessionId = null;
      }
    }

    if (!activeSessionId) {
      const created = await createChatSession({
        userUid: params.userUid,
        title: params.titleHint.slice(0, 90),
        model: params.model,
        persona: params.persona,
      });
      if (!created) return null;
      activeSessionId = created.id;
    } else {
      await db
        .update(aiChatSessions)
        .set({ model: params.model, persona: params.persona, updatedAt: new Date() })
        .where(eq(aiChatSessions.id, activeSessionId));
    }

    await db.insert(aiChatMessages).values([
      {
        sessionId: activeSessionId,
        role: 'user',
        content: params.userText,
        modelUsed: params.model,
        groundingJson: null,
      },
      {
        sessionId: activeSessionId,
        role: 'model',
        content: params.modelText,
        modelUsed: params.model,
        groundingJson: null,
      },
    ]);

    return { sessionId: activeSessionId };
  } catch (err) {
    console.error('[db/aiRepository] appendChatTurn failed:', err);
    return null;
  }
}

export async function deleteChatSession(userUid: string, sessionId: number): Promise<boolean> {
  if (!isSqlConfigured()) return false;
  try {
    const deleted = await db
      .delete(aiChatSessions)
      .where(and(eq(aiChatSessions.id, sessionId), eq(aiChatSessions.userUid, userUid)))
      .returning({ id: aiChatSessions.id });
    return deleted.length > 0;
  } catch (err) {
    console.error('[db/aiRepository] deleteChatSession failed:', err);
    throw new Error('Unable to delete chat session.');
  }
}

export async function saveTranscription(params: {
  userUid: string;
  title: string;
  transcript: string;
  mimeType?: string | null;
  durationSeconds?: number | null;
}): Promise<AiTranscriptionRecord | null> {
  if (!isSqlConfigured()) return null;
  try {
    const [row] = await db
      .insert(aiTranscriptions)
      .values({
        userUid: params.userUid,
        title: params.title.trim().slice(0, 140) || 'Audio Recording',
        transcript: params.transcript,
        mimeType: params.mimeType?.slice(0, 80) ?? null,
        durationSeconds: params.durationSeconds ?? null,
      })
      .returning();
    return row || null;
  } catch (err) {
    console.error('[db/aiRepository] saveTranscription failed:', err);
    return null;
  }
}

export async function listUserTranscriptions(userUid: string): Promise<AiTranscriptionRecord[]> {
  if (!isSqlConfigured()) return [];
  try {
    return await db
      .select()
      .from(aiTranscriptions)
      .where(eq(aiTranscriptions.userUid, userUid))
      .orderBy(desc(aiTranscriptions.createdAt))
      .limit(30);
  } catch (err) {
    console.error('[db/aiRepository] listUserTranscriptions failed:', err);
    throw new Error('Unable to load saved transcriptions.');
  }
}

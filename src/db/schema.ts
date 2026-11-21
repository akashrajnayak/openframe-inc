import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  jsonb,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  uid: text('uid').primaryKey(),
  email: text('email').notNull(),
  displayName: text('display_name'),
  photoUrl: text('photo_url'),
  role: text('role').default('student').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const aiChatSessions = pgTable('ai_chat_sessions', {
  id: serial('id').primaryKey(),
  userUid: text('user_uid')
    .notNull()
    .references(() => users.uid, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  model: text('model').default('gemini-4-hydrogen').notNull(),
  persona: text('persona').default('academic_tutor').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const aiChatMessages = pgTable('ai_chat_messages', {
  id: serial('id').primaryKey(),
  sessionId: integer('session_id')
    .notNull()
    .references(() => aiChatSessions.id, { onDelete: 'cascade' }),
  role: text('role').notNull(),
  content: text('content').notNull(),
  modelUsed: text('model_used'),
  groundingJson: jsonb('grounding_json'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const aiTranscriptions = pgTable('ai_transcriptions', {
  id: serial('id').primaryKey(),
  userUid: text('user_uid')
    .notNull()
    .references(() => users.uid, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  transcript: text('transcript').notNull(),
  mimeType: text('mime_type'),
  durationSeconds: integer('duration_seconds'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  chatSessions: many(aiChatSessions),
  transcriptions: many(aiTranscriptions),
}));

export const aiChatSessionsRelations = relations(aiChatSessions, ({ one, many }) => ({
  user: one(users, {
    fields: [aiChatSessions.userUid],
    references: [users.uid],
  }),
  messages: many(aiChatMessages),
}));

export const aiChatMessagesRelations = relations(aiChatMessages, ({ one }) => ({
  session: one(aiChatSessions, {
    fields: [aiChatMessages.sessionId],
    references: [aiChatSessions.id],
  }),
}));

export const aiTranscriptionsRelations = relations(aiTranscriptions, ({ one }) => ({
  user: one(users, {
    fields: [aiTranscriptions.userUid],
    references: [users.uid],
  }),
}));

export type UserRecord = typeof users.$inferSelect;
export type AiChatSessionRecord = typeof aiChatSessions.$inferSelect;
export type AiChatMessageRecord = typeof aiChatMessages.$inferSelect;
export type AiTranscriptionRecord = typeof aiTranscriptions.$inferSelect;

import {
  bigint,
  boolean,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

export const telegramSubscriber = pgTable('telegram_subscriber', {
  id: uuid('id').primaryKey().defaultRandom(),
  chatId: bigint('chat_id', { mode: 'number' }).notNull(),
  username: varchar('username', { length: 255 }),
  subscribed: boolean('subscribed').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

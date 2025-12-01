import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { PostgresDatabase } from '../drizzle.types';
import { telegramSubscriber } from '../schema';
import { eq } from 'drizzle-orm';
import { Inject } from '@nestjs/common';
import { POSTGRES_CONNECTION } from '../drizzle.constants';

export type TelegramSubscriberSelectModel = InferSelectModel<
  typeof telegramSubscriber
>;
export type TelegramSubscriberInsertModel = InferInsertModel<
  typeof telegramSubscriber
>;
export type TelegramSubscriberUpdateModel = Partial<
  Omit<TelegramSubscriberInsertModel, 'id' | 'createdAt' | 'updatedAt'>
>;

export class TelegramSubscriberRepo {
  constructor(
    @Inject(POSTGRES_CONNECTION)
    private readonly postgres: PostgresDatabase,
  ) {}

  async findByChatId(
    chatId: TelegramSubscriberSelectModel['chatId'],
  ): Promise<TelegramSubscriberSelectModel | null> {
    const result = await this.postgres
      .select()
      .from(telegramSubscriber)
      .where(eq(telegramSubscriber.chatId, chatId));

    return result[0] ?? null;
  }

  async create(
    data: TelegramSubscriberInsertModel,
  ): Promise<TelegramSubscriberSelectModel> {
    const result = await this.postgres
      .insert(telegramSubscriber)
      .values(data)
      .returning();

    return result[0];
  }

  async updateByChatId(
    chatId: TelegramSubscriberSelectModel['chatId'],
    data: TelegramSubscriberUpdateModel,
  ): Promise<TelegramSubscriberSelectModel | null> {
    const result = await this.postgres
      .update(telegramSubscriber)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(telegramSubscriber.chatId, chatId))
      .returning();
    return result[0] ?? null;
  }

  async upsert(
    chatId: TelegramSubscriberSelectModel['chatId'],
    username: string | undefined,
    subscribed: boolean,
  ): Promise<TelegramSubscriberSelectModel> {
    const existing = await this.findByChatId(chatId);

    if (existing) {
      const updated = await this.updateByChatId(chatId, {
        username,
        subscribed,
      });
      return updated!;
    }

    return this.create({ chatId, username, subscribed });
  }

  async findAllSubscribed(): Promise<TelegramSubscriberSelectModel[]> {
    return this.postgres
      .select()
      .from(telegramSubscriber)
      .where(eq(telegramSubscriber.subscribed, true));
  }
}

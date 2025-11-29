import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { PostgresDatabase } from '../drizzle.types';
import { itemValues } from '../schema';
import { eq, and } from 'drizzle-orm';
import { ItemSelectModel } from './item.repo';
import { POSTGRES_CONNECTION } from '../drizzle.constants';
import { Inject } from '@nestjs/common';

export type ItemValuesSelectModel = InferSelectModel<typeof itemValues>;
export type ItemValuesInsertModel = InferInsertModel<typeof itemValues>;
export type ItemValuesUpdateModel = Partial<
  Omit<
    ItemValuesInsertModel,
    'id' | 'createdAt' | 'updatedAt' | 'itemId' | 'source'
  >
>;

export class ItemValuesRepo {
  constructor(
    @Inject(POSTGRES_CONNECTION)
    private readonly postgres: PostgresDatabase,
  ) {}

  async findAll(): Promise<ItemValuesSelectModel[]> {
    return this.postgres.select().from(itemValues);
  }

  async findById(
    id: ItemValuesSelectModel['id'],
  ): Promise<ItemValuesSelectModel | null> {
    const result = await this.postgres
      .select()
      .from(itemValues)
      .where(eq(itemValues.id, id));

    return result[0] ?? null;
  }

  async create(data: ItemValuesInsertModel): Promise<ItemValuesSelectModel> {
    const result = await this.postgres
      .insert(itemValues)
      .values(data)
      .returning();

    return result[0];
  }

  async updateById(
    id: ItemValuesSelectModel['id'],
    data: ItemValuesUpdateModel,
  ): Promise<ItemValuesSelectModel | null> {
    const result = await this.postgres
      .update(itemValues)
      .set(data)
      .where(eq(itemValues.id, id))
      .returning();
    return result[0] ?? null;
  }

  async updateByItemId(
    itemId: ItemSelectModel['id'],
    data: ItemValuesUpdateModel,
  ): Promise<ItemValuesSelectModel | null> {
    const result = await this.postgres
      .update(itemValues)
      .set(data)
      .where(eq(itemValues.itemId, itemId))
      .returning();
    return result[0] ?? null;
  }

  async deleteById(id: ItemValuesSelectModel['id']): Promise<void> {
    await this.postgres.delete(itemValues).where(eq(itemValues.id, id));
  }

  async findByItemId(itemId: string): Promise<ItemValuesSelectModel[]> {
    return this.postgres
      .select()
      .from(itemValues)
      .where(eq(itemValues.itemId, itemId));
  }

  async findByItemIdAndSource(
    itemId: ItemSelectModel['id'],
    source: ItemValuesInsertModel['source'],
  ): Promise<ItemValuesSelectModel[]> {
    return this.postgres
      .select()
      .from(itemValues)
      .where(and(eq(itemValues.itemId, itemId), eq(itemValues.source, source)));
  }
}

import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { PostgresDatabase } from '../drizzle.types';
import { item } from '../schema';
import { eq } from 'drizzle-orm';

export type ItemSelectModel = InferSelectModel<typeof item>;
export type ItemInsertModel = InferInsertModel<typeof item>;
export type ItemUpdateModel = Omit<
  ItemInsertModel,
  'id' | 'createdAt' | 'updatedAt'
>;

export class ItemRepo {
  constructor(private readonly postgres: PostgresDatabase) {}

  async findAll(): Promise<ItemSelectModel[]> {
    return this.postgres.select().from(item);
  }

  async findById(id: ItemSelectModel['id']): Promise<ItemSelectModel | null> {
    const result = await this.postgres
      .select()
      .from(item)
      .where(eq(item.id, id));

    return result[0] ?? null;
  }

  async create(data: ItemInsertModel): Promise<ItemSelectModel> {
    const result = await this.postgres.insert(item).values(data).returning();

    return result[0];
  }

  async updateById(
    id: ItemSelectModel['id'],
    data: ItemUpdateModel,
  ): Promise<ItemSelectModel | null> {
    const result = await this.postgres
      .update(item)
      .set(data)
      .where(eq(item.id, id))
      .returning();
    return result[0] ?? null;
  }

  async deleteById(id: ItemSelectModel['id']): Promise<void> {
    await this.postgres.delete(item).where(eq(item.id, id));
  }
}

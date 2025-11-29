import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { PostgresDatabase } from '../drizzle.types';
import { item, itemValues } from '../schema';
import { eq } from 'drizzle-orm';
import { ItemValuesSelectModel } from './item-values.repo';
import { Inject } from '@nestjs/common';
import { POSTGRES_CONNECTION } from '../drizzle.constants';

export type ItemSelectModel = InferSelectModel<typeof item>;
export type ItemInsertModel = InferInsertModel<typeof item>;
export type ItemUpdateModel = Omit<
  ItemInsertModel,
  'id' | 'createdAt' | 'updatedAt'
>;
export type ItemWithValuesSelectModel = ItemSelectModel & {
  values: Pick<
    ItemValuesSelectModel,
    'value' | 'stability' | 'demand' | 'rarity'
  > | null;
};

export class ItemRepo {
  constructor(
    @Inject(POSTGRES_CONNECTION)
    private readonly postgres: PostgresDatabase,
  ) {}

  async findAll(): Promise<ItemSelectModel[]> {
    return this.postgres.select().from(item);
  }

  async findAllWithValues(): Promise<ItemWithValuesSelectModel[]> {
    const result = await this.postgres
      .select()
      .from(item)
      .leftJoin(itemValues, eq(item.id, itemValues.itemId));

    return result.map((item) => ({
      ...item.item,
      values: item.item_values
        ? {
            value: item.item_values?.value,
            stability: item.item_values?.stability,
            demand: item.item_values?.demand,
            rarity: item.item_values?.rarity,
          }
        : null,
    }));
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

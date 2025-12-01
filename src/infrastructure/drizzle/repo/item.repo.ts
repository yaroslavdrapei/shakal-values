import {
  inArray,
  InferInsertModel,
  InferSelectModel,
  ilike,
  or,
} from 'drizzle-orm';
import { PostgresDatabase } from '../drizzle.types';
import { item, itemValues } from '../schema';
import { eq, and } from 'drizzle-orm';
import { ItemValuesSelectModel } from './item-values.repo';
import { Inject } from '@nestjs/common';
import { POSTGRES_CONNECTION } from '../drizzle.constants';
import { ItemSource } from '@modules/item/item.enums';

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
  >;
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
      .innerJoin(
        itemValues,
        and(
          eq(item.id, itemValues.itemId),
          eq(itemValues.source, ItemSource.SUPREME),
        ),
      );

    return result.map((item) => ({
      ...item.item,
      values: {
        value: item.item_values.value,
        stability: item.item_values.stability,
        demand: item.item_values.demand,
        rarity: item.item_values.rarity,
      },
    }));
  }

  async findById(id: ItemSelectModel['id']): Promise<ItemSelectModel | null> {
    const result = await this.postgres
      .select()
      .from(item)
      .where(eq(item.id, id));

    return result[0] ?? null;
  }

  async findByNames(names: string[]): Promise<ItemWithValuesSelectModel[]> {
    const result = await this.postgres
      .select()
      .from(item)
      .where(inArray(item.name, names))
      .innerJoin(
        itemValues,
        and(
          eq(item.id, itemValues.itemId),
          eq(itemValues.source, ItemSource.SUPREME),
        ),
      );

    return result.map((item) => ({
      ...item.item,
      values: {
        value: item.item_values.value,
        stability: item.item_values.stability,
        demand: item.item_values.demand,
        rarity: item.item_values.rarity,
      },
    }));
  }

  async findByNamesFuzzy(
    searchTerms: string[],
  ): Promise<ItemWithValuesSelectModel[]> {
    if (searchTerms.length === 0) return [];

    const conditions = searchTerms.flatMap((term) => {
      const normalizedTerm = term.trim();
      return [
        ilike(item.name, normalizedTerm),
        ilike(item.name, `${normalizedTerm}%`),
        ilike(item.name, `%${normalizedTerm}%`),
      ];
    });

    const result = await this.postgres
      .select()
      .from(item)
      .where(or(...conditions))
      .innerJoin(
        itemValues,
        and(
          eq(item.id, itemValues.itemId),
          eq(itemValues.source, ItemSource.SUPREME),
        ),
      );

    const itemMap = new Map<string, ItemWithValuesSelectModel>();

    result.forEach((row) => {
      const itemName = row.item.name.toLowerCase();
      if (!itemMap.has(itemName)) {
        itemMap.set(itemName, {
          ...row.item,
          values: {
            value: row.item_values.value,
            stability: row.item_values.stability,
            demand: row.item_values.demand,
            rarity: row.item_values.rarity,
          },
        });
      }
    });

    return Array.from(itemMap.values());
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

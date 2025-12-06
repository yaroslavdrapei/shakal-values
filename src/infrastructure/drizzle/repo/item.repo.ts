import {
  InferInsertModel,
  InferSelectModel,
  ilike,
  or,
  sql,
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
    'value' | 'stability' | 'demand' | 'rarity' | 'rangedValue'
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
        rangedValue: item.item_values.rangedValue,
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

  async findByName(name: string): Promise<ItemWithValuesSelectModel | null> {
    const result = await this.postgres
      .select()
      .from(item)
      .where(sql`LOWER(${item.name}) = LOWER(${name})`)
      .innerJoin(
        itemValues,
        and(
          eq(item.id, itemValues.itemId),
          eq(itemValues.source, ItemSource.SUPREME),
        ),
      );

    return result[0]
      ? {
          ...result[0].item,
          values: {
            value: result[0].item_values.value,
            stability: result[0].item_values.stability,
            demand: result[0].item_values.demand,
            rarity: result[0].item_values.rarity,
            rangedValue: result[0].item_values.rangedValue,
          },
        }
      : null;
  }

  async findByNames(names: string[]): Promise<ItemWithValuesSelectModel[]> {
    const result = await this.postgres
      .select()
      .from(item)
      .where(
        sql`LOWER(${item.name}) IN (${sql.join(
          names.map((name) => sql`LOWER(${name})`),
          sql`, `,
        )})`,
      )
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
        rangedValue: item.item_values.rangedValue,
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

    return result.map((item) => ({
      ...item.item,
      values: {
        value: item.item_values.value,
        stability: item.item_values.stability,
        demand: item.item_values.demand,
        rarity: item.item_values.rarity,
        rangedValue: item.item_values.rangedValue,
      },
    }));
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

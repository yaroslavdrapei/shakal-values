import {
  decimal,
  jsonb,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { item } from './item';
import { relations } from 'drizzle-orm';
import { ItemStability, ItemSource } from '@modules/item/item.enums';

export const itemStability = pgEnum(
  'item_stability',
  Object.values(ItemStability) as [string, ...string[]],
);

export const itemSource = pgEnum(
  'item_source',
  Object.values(ItemSource) as [string, ...string[]],
);

export const itemValues = pgTable('item_values', {
  id: uuid('id').primaryKey().defaultRandom(),
  itemId: uuid('item_id')
    .references(() => item.id)
    .notNull(),
  value: varchar('value', { length: 70 }).notNull(),
  stability: itemStability('stability').notNull(),
  demand: decimal('demand', { precision: 10, scale: 2 }).notNull(),
  rarity: decimal('rarity', { precision: 10, scale: 2 }).notNull(),
  rangedValue: jsonb('ranged_value').$type<{ min: number; max: number }>(),
  source: itemSource('source').notNull(),

  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const itemValuesRelations = relations(itemValues, ({ one }) => ({
  item: one(item, {
    fields: [itemValues.itemId],
    references: [item.id],
  }),
}));

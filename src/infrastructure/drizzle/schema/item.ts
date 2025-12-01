import { pgEnum, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { ItemCategory, ItemType } from '@modules/item/item.enums';

export const itemType = pgEnum(
  'item_type',
  Object.values(ItemType) as [string, ...string[]],
);

export const itemCategory = pgEnum(
  'item_category',
  Object.values(ItemCategory) as [string, ...string[]],
);

export const item = pgTable('item', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 70 }).notNull(),
  type: itemType('type').$type<ItemType>().notNull(),
  origin: varchar('origin', { length: 70 }).notNull(),
  category: itemCategory('category').$type<ItemCategory>().notNull(),
  class: itemType('class').$type<ItemType>(),

  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

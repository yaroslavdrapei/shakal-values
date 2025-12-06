import { FeatureUsage, MetricSource } from '@modules/metrics/metrics.enums';
import {
  bigint,
  boolean,
  jsonb,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

export const featureUsage = pgEnum(
  'feature_usage',
  Object.values(FeatureUsage) as [string, ...string[]],
);

export const metricSource = pgEnum(
  'metric_source',
  Object.values(MetricSource) as [string, ...string[]],
);

export const metricsFeatureUsage = pgTable('metrics_feature_usage', {
  id: uuid('id').primaryKey().defaultRandom(),
  feature: featureUsage('feature').$type<FeatureUsage>().notNull(),
  source: metricSource('source').$type<MetricSource>().notNull(),
  chatId: bigint('chat_id', { mode: 'number' }), // for telegram (no relations intentionally)
  userId: uuid('user_id'), // for webapp (no relations intentionally)
  success: boolean('success').notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

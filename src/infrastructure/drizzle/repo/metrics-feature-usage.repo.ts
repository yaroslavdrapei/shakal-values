import { InferInsertModel, InferSelectModel, sql, lt } from 'drizzle-orm';
import { PostgresDatabase } from '../drizzle.types';
import { metricsFeatureUsage } from '../schema/metrics/metrics-feature-usage';
import { POSTGRES_CONNECTION } from '../drizzle.constants';
import { Inject } from '@nestjs/common';

export type MetricsFeatureUsageSelectModel = InferSelectModel<
  typeof metricsFeatureUsage
>;
export type MetricsFeatureUsageInsertModel = Omit<
  InferInsertModel<typeof metricsFeatureUsage>,
  'id' | 'createdAt'
>;

export class MetricsFeatureUsageRepo {
  constructor(
    @Inject(POSTGRES_CONNECTION)
    private readonly postgres: PostgresDatabase,
  ) {}

  async create(
    data: MetricsFeatureUsageInsertModel,
  ): Promise<MetricsFeatureUsageSelectModel> {
    const result = await this.postgres
      .insert(metricsFeatureUsage)
      .values(data)
      .returning();

    return result[0];
  }

  async deleteOlderThanMonths(months: number): Promise<number> {
    const result = await this.postgres
      .delete(metricsFeatureUsage)
      .where(
        lt(
          metricsFeatureUsage.createdAt,
          sql`NOW() - INTERVAL '${sql.raw(months.toString())} months'`,
        ),
      )
      .returning();

    return result.length;
  }
}

import {
  MetricsFeatureUsageRepo,
  MetricsFeatureUsageSelectModel,
} from '@infrastructure/drizzle/repo/metrics-feature-usage.repo';
import { MetricsFeatureUsageInsertModel } from '@infrastructure/drizzle/repo/metrics-feature-usage.repo';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MetricsService {
  constructor(
    private readonly metricsFeatureUsageRepo: MetricsFeatureUsageRepo,
  ) {}

  async createFeatureUsageMetric(
    data: MetricsFeatureUsageInsertModel,
  ): Promise<MetricsFeatureUsageSelectModel> {
    return await this.metricsFeatureUsageRepo.create(data);
  }

  async deleteOldMetrics(months: number): Promise<{ deletedCount: number }> {
    const deletedCount =
      await this.metricsFeatureUsageRepo.deleteOlderThanMonths(months);
    return { deletedCount };
  }
}

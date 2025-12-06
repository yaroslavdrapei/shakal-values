import { HttpService } from '@nestjs/axios';
import { PhotoContext } from './telegram.types';
import { Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { InvService } from '@modules/ai/inv/inv.service';
import { TradeService } from '@modules/ai/trade/trade.service';
import { MetricsService } from '@modules/metrics/metrics.service';
import { FeatureUsage, MetricSource } from '@modules/metrics/metrics.enums';

@Injectable()
export class TelegramPhotoService {
  private readonly logger = new Logger(TelegramPhotoService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly tradeService: TradeService,
    private readonly invService: InvService,
    private readonly metricsService: MetricsService,
  ) {}

  async handleTradeImage(ctx: PhotoContext) {
    await ctx.reply('Processing your trade image...');

    const imageBuffer = await this.getImageBuffer(ctx);
    const base64Image = imageBuffer.toString('base64');

    try {
      const result = await this.tradeService.evaluateTrade(base64Image);

      await ctx.reply(result);
      await this.metricsService.createFeatureUsageMetric({
        feature: FeatureUsage.TRADE,
        success: true,
        source: MetricSource.TELEGRAM,
        chatId: ctx.from.id,
        metadata: {
          answer: result,
        },
      });
    } catch (error) {
      this.logger.error(`Error processing trade image: ${String(error)}`);
      await ctx.reply(
        'Sorry, I encountered an error while processing your trade image. Please try again',
      );
      await this.metricsService.createFeatureUsageMetric({
        feature: FeatureUsage.TRADE,
        success: false,
        source: MetricSource.TELEGRAM,
        chatId: ctx.from.id,
        metadata: {
          error,
        },
      });
    }
  }

  async handleInventoryImage(ctx: PhotoContext) {
    await ctx.reply('Processing your inventory image...');

    const imageBuffer = await this.getImageBuffer(ctx);
    const base64Image = imageBuffer.toString('base64');

    try {
      const result =
        await this.invService.calculateInventoryTotalValue(base64Image);

      await ctx.reply(result);
      await this.metricsService.createFeatureUsageMetric({
        feature: FeatureUsage.INV,
        success: true,
        source: MetricSource.TELEGRAM,
        chatId: ctx.from.id,
        metadata: {
          answer: result,
        },
      });
    } catch (error) {
      this.logger.error(`Error processing inventory image: ${String(error)}`);
      await ctx.reply(
        'Sorry, I encountered an error while processing your inventory image. Please try again',
      );
      await this.metricsService.createFeatureUsageMetric({
        feature: FeatureUsage.INV,
        success: false,
        source: MetricSource.TELEGRAM,
        chatId: ctx.from.id,
        metadata: {
          error,
        },
      });
    }
  }

  private async getImageBuffer(ctx: PhotoContext): Promise<Buffer> {
    const photo = ctx.message.photo;
    const largestPhoto = photo[photo.length - 1];

    const fileLink = await ctx.telegram.getFileLink(largestPhoto.file_id);

    const response = await firstValueFrom(
      this.httpService.get(fileLink.toString(), {
        responseType: 'arraybuffer',
      }),
    );

    return Buffer.from(response.data);
  }
}

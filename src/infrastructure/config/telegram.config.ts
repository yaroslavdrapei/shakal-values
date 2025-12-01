import { Configuration, Value } from '@itgorillaz/configify';
import { IsString } from 'class-validator';

@Configuration()
export class TelegramConfig {
  @Value('TELEGRAM_TOKEN')
  @IsString()
  public token: string;
}

import { Configuration, Value } from '@itgorillaz/configify';
import { IsNumber } from 'class-validator';

@Configuration()
export class AppConfig {
  @Value('APP_PORT', { parse: parseInt })
  @IsNumber()
  public port: number;
}

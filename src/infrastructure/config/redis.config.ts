import { Configuration, Value } from '@itgorillaz/configify';
import { IsNumber, IsString } from 'class-validator';

@Configuration()
export class RedisConfig {
  @Value('REDIS_HOST')
  @IsString()
  public host: string;

  @Value('REDIS_PORT', { parse: parseInt })
  @IsNumber()
  public port: number;

  @Value('REDIS_PASSWORD')
  @IsString()
  public password: string;
}

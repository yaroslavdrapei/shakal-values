import { Configuration, Value } from '@itgorillaz/configify';
import { IsString } from 'class-validator';

@Configuration()
export class RedisConfig {
  @Value('REDIS_URL')
  @IsString()
  public url: string;
}

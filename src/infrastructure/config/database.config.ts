import { Configuration, Value } from '@itgorillaz/configify';
import { IsString } from 'class-validator';

@Configuration()
export class DatabaseConfig {
  @Value('DATABASE_URL')
  @IsString()
  public databaseUrl: string;
}

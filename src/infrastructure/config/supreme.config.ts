import { Configuration, Value } from '@itgorillaz/configify';
import { IsString } from 'class-validator';

@Configuration()
export class SupremeConfig {
  @Value('SUPREME_BASE_URL')
  @IsString()
  public baseUrl: string;

  public pages: string[] = [
    'uniques',
    'ancients',
    'godlies',
    'legendaries',
    'rares',
    'uncommons',
    'commons',
    'misc',
    'pets',
    'vintages',
    'chromas',
  ];
}

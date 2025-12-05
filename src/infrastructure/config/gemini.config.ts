import { IsString } from 'class-validator';
import { Configuration, Value } from '@itgorillaz/configify';

@Configuration()
export class GeminiConfig {
  @Value('GEMINI_API_KEY')
  @IsString()
  public apiKey: string;

  @Value('GEMINI_MODEL')
  @IsString()
  public model: string;
}

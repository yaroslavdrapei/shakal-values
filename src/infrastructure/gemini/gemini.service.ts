import {
  GoogleGenerativeAI,
  GenerativeModel,
  ModelParams,
} from '@google/generative-ai';
import { GeminiConfig } from '@infrastructure/config/gemini.config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GeminiService {
  private genAI: GoogleGenerativeAI;

  constructor(private readonly geminiConfig: GeminiConfig) {
    this.genAI = new GoogleGenerativeAI(this.geminiConfig.apiKey);
  }

  provideGenerativeModel(params: Omit<ModelParams, 'model'>): GenerativeModel {
    return this.genAI.getGenerativeModel({
      model: this.geminiConfig.model,
      ...params,
    });
  }
}

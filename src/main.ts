import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import { setup } from './app.setup';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, new FastifyAdapter());
  await setup(app);
}
void bootstrap();

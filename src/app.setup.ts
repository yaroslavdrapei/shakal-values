import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppConfig } from './infrastructure/config/app.config';

export const setup = async (app: INestApplication) => {
  const appConfig = app.get<AppConfig>(AppConfig);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Shakal Values service')
    .setDescription('The shakal values service API description')
    .setVersion('1.0')
    .build();

  const documentFactory = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('swagger', app, documentFactory);

  const port = appConfig.port;

  await app.listen(port, '0.0.0.0');
};

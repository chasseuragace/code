import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // Serve static assets under /public for cutout URLs
  app.useStaticAssets(join(process.cwd(), 'public'), { prefix: '/public/' });
  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Agency Service API')
    .setDescription('Public, Agency, and Candidate endpoints')
    .setVersion('1.0.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(3000);
  const url = await app.getUrl();
  // Log the Swagger URL for convenience
  // eslint-disable-next-line no-console
  console.log(`[bootstrap] Swagger UI available at ${url}/docs`);
}
bootstrap();

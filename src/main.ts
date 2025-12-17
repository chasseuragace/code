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
  
  // Enable CORS for frontend apps
  app.enableCors({
    origin: (origin, callback) => {
      // Allow localhost origins
      if (!origin || origin.startsWith('http://localhost:') || origin.startsWith('https://localhost:')) {
        callback(null, true);
        return;
      }
      // Allow Netlify deployments
      if (origin && (origin.includes('netlify.app') || origin.includes('netlify.com'))) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization, Accept, X-Requested-With',
    credentials: true,
  });
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

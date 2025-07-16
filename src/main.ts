import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as morgan from 'morgan';
import { AppModule } from './app.module';
import job from './config/cron';

const PORT = process.env.PORT || 8080;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const devOrigin = process.env.FRONTEND_DEVELOPMENT || 'http://localhost:3000';
  const prodOrigin =
    process.env.FRONTEND_PRODUCTION || 'https://nutri-app-pro.vercel.app';
  const allowedOrigins = [devOrigin, prodOrigin];
  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ): void => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
  });
  app.use(
    morgan('dev', {
      stream: { write: (message: string) => console.log(message.trim()) },
    }),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('NutriAppPro')
    .setDescription('Nutrition tracking app')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory, {
    swaggerOptions: { persistAuthorization: true },
  });

  if (process.env.NODE_ENV === 'production') {
    job.start();
  }

  await app.listen(PORT);
  console.log(`\n\nServer is running on port ${PORT}\n\n`);
}
void bootstrap();

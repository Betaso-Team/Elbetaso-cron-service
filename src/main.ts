import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  const port = process.env.PORT || 3001;

  await app.listen(port);

  logger.log(`🚀 Servicio de Cron Jobs corriendo en puerto ${port}`);
  logger.log(`📊 Health check: http://localhost:${port}/cron/health`);
  logger.log(`📋 Lista de jobs: http://localhost:${port}/cron/jobs`);
}

bootstrap();

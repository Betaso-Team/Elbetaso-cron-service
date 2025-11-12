import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { EnvService } from './env';
import { LoggerBuilder } from './logger';
import { GlobalExceptionFilter } from './common/filters';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  const loggerBuilder = app.get(LoggerBuilder);
  app.useLogger(loggerBuilder.build());

  // Registrar filtro global de excepciones
  app.useGlobalFilters(new GlobalExceptionFilter(loggerBuilder));

  // Configurar Swagger
  const config = new DocumentBuilder()
    .setTitle('Elbetaso Cron Service')
    .setDescription(
      'API para gestionar cron jobs que ejecutan tareas programadas en endpoints externos',
    )
    .setVersion('1.0')
    .addTag('cron', 'Operaciones relacionadas con cron jobs')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const envService = app.get(EnvService);
  const port = envService.get('PORT');
  await app.listen(port);

  const logger = loggerBuilder.buildWithContext('Bootstrap');
  logger.log(`🚀 Servicio de Cron Jobs corriendo en puerto ${port}`);
  logger.log(`📚 Documentación API: http://localhost:${port}/api`);
  logger.log(`📋 Lista de jobs: http://localhost:${port}/cron`);
}

bootstrap();

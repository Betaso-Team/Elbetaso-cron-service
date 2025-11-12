import { Global, Module } from '@nestjs/common';
import { LoggerBuilder } from './logger.builder';

/**
 * Modulo global de logging
 * Se marca como Global para que LoggerBuilder este disponible en toda la aplicacion
 */
@Global()
@Module({
  providers: [LoggerBuilder],
  exports: [LoggerBuilder],
})
export class LoggerModule {}

import { Injectable } from '@nestjs/common';
import pino, { Logger as PinoLogger } from 'pino';
import { EnvService } from '../env/env.service';
import { LoggerService } from './logger.service';

/**
 * Builder para crear instancias de LoggerService con contexto
 * Maneja toda la configuracion de Pino
 */
@Injectable()
export class LoggerBuilder {
  private readonly rootLogger: PinoLogger;

  constructor(private readonly envService: EnvService) {
    const nodeEnv = this.envService.get('NODE_ENV');
    const logLevel = this.envService.get('LOG_LEVEL');

    this.rootLogger = pino({
      level: logLevel,
      transport:
        nodeEnv !== 'production'
          ? {
              target: 'pino-pretty',
              options: {
                colorize: true,
                translateTime: 'HH:MM:ss Z',
                ignore: 'pid,hostname',
              },
            }
          : undefined,
    });
  }

  /**
   * Construye un LoggerService con un contexto especifico
   * Usa child loggers de Pino para mejor rendimiento
   */
  buildWithContext(context: string): LoggerService {
    const childLogger = this.rootLogger.child({ context });
    return new LoggerService(childLogger);
  }

  /**
   * Obtiene el logger raiz sin contexto
   * Util para casos especiales como app.useLogger()
   */
  build(): LoggerService {
    return new LoggerService(this.rootLogger);
  }
}

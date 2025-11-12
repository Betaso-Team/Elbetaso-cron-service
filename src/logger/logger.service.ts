import { LoggerService as NestLoggerService } from '@nestjs/common';
import { Logger as PinoLogger } from 'pino';

/**
 * Servicio de logging basado en Pino compatible con NestJS
 * Solo contiene metodos de logging, sin configuracion
 * Usar LoggerBuilder para crear instancias con contexto
 */
export class LoggerService implements NestLoggerService {
  constructor(private readonly logger: PinoLogger) {}

  /**
   * Escribe un mensaje de log informativo
   */
  log(message: string): void {
    this.logger.info(message);
  }

  /**
   * Escribe un mensaje de error
   */
  error(message: string, trace?: string): void {
    if (trace) {
      this.logger.error({ trace }, message);
    } else {
      this.logger.error(message);
    }
  }

  /**
   * Escribe un mensaje de advertencia
   */
  warn(message: string): void {
    this.logger.warn(message);
  }

  /**
   * Escribe un mensaje de depuracion
   */
  debug(message: string): void {
    this.logger.debug(message);
  }

  /**
   * Escribe un mensaje verbose
   */
  verbose(message: string): void {
    this.logger.trace(message);
  }

  /**
   * Escribe un mensaje fatal
   */
  fatal(message: string, trace?: string): void {
    if (trace) {
      this.logger.fatal({ trace }, message);
    } else {
      this.logger.fatal(message);
    }
  }

  /**
   * Obtiene la instancia del logger de Pino
   * Util para operaciones avanzadas
   */
  getPinoLogger(): PinoLogger {
    return this.logger;
  }
}

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
} from '@nestjs/common';
import { Response } from 'express';
import { LoggerBuilder } from '../../logger';

/**
 * Filtro global de excepciones
 * - Permite pasar errores 4XX sin modificarlos
 * - Convierte cualquier otro error en InternalServerErrorException
 * - Registra errores 5XX en el stream de error
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = this.loggerBuilder.buildWithContext(
    'GlobalExceptionFilter',
  );

  constructor(private readonly loggerBuilder: LoggerBuilder) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();

      if (status >= 400 && status < 500) {
        response.status(status).json(exception.getResponse());
        return;
      }

      this.logger.error(
        `Error interno del servidor: ${exception.message}`,
        exception.stack,
      );
      response.status(status).json(exception.getResponse());
      return;
    }

    this.logger.error(
      `Error no manejado: ${exception instanceof Error ? exception.message : 'Error desconocido'}`,
      exception instanceof Error ? exception.stack : undefined,
    );
    const internalError = new InternalServerErrorException(
      'Error interno del servidor',
    );
    response
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json(internalError.getResponse());
  }
}

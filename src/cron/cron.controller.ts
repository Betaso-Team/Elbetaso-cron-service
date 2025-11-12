import {
  Controller,
  Get,
  Post,
  Param,
  ParseIntPipe,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import { CronService } from './cron.service';
import { CronServiceError, JobNotFoundError } from './cron.errors';

@ApiTags('cron')
@Controller('cron')
export class CronController {
  constructor(private readonly cronService: CronService) {}

  /**
   * Obtener lista de cron jobs
   * Retorna la lista completa de cron jobs configurados exitosamente
   */
  @Get('/')
  @ApiInternalServerErrorResponse({
    description: 'Error interno del servidor',
  })
  getJobs(): {
    totalJobs: number;
    jobs: Array<{
      index: number;
      name: string;
      schedule: string;
      endpoint: string;
      enabled: boolean;
    }>;
  } {
    const jobs = this.cronService.getJobList();
    return {
      totalJobs: jobs.length,
      jobs,
    };
  }

  /**
   * Obtener estado de un cron job
   * Retorna el estado actual de un job específico (si está corriendo, última y próxima ejecución)
   * @param index - Índice del job (0-based)
   * @throws {NotFoundException} Job no encontrado con el índice especificado
   */
  @Get('/:index/status')
  @ApiBadRequestResponse({
    description: 'El parámetro index no es un número válido',
  })
  @ApiNotFoundResponse({
    description: 'Job no encontrado con el índice especificado',
  })
  @ApiInternalServerErrorResponse({
    description: 'Error interno del servidor',
  })
  getJobStatus(@Param('index', ParseIntPipe) index: number): {
    running: boolean;
    lastDate: string | null;
    nextDate: string | null;
  } {
    try {
      return this.cronService.getJobStatus(index);
    } catch (error) {
      if (error instanceof JobNotFoundError) {
        throw new NotFoundException({
          message: error.message,
          jobIndex: error.jobIndex,
        });
      }
      throw error;
    }
  }

  /**
   * Ejecutar un cron job manualmente
   * Ejecuta un job específico de forma manual, sin esperar a su próxima ejecución programada.
   * Si el job se ejecuta exitosamente, retorna success: true con status 201.
   * Si el job falla durante la ejecución (ej: timeout, error de red), retorna success: false con status 200.
   * @param index - Índice del job (0-based)
   * @throws {NotFoundException} Job no encontrado con el índice especificado
   * @throws {BadRequestException} Error de validación o error de negocio
   */
  @Post('/:index/start')
  @ApiBadRequestResponse({
    description: 'El parámetro index no es un número válido',
  })
  @ApiNotFoundResponse({
    description: 'Job no encontrado con el índice especificado',
  })
  @ApiInternalServerErrorResponse({
    description: 'Error interno del servidor',
  })
  async startJob(@Param('index', ParseIntPipe) index: number): Promise<{
    success: boolean;
    message: string;
    result?: unknown;
    error?: string;
  }> {
    try {
      const result = await this.cronService.startJobManually(index);

      if (result.success) {
        return {
          success: true,
          message: 'Job ejecutado manualmente',
          result: result.data,
        };
      } else {
        return {
          success: false,
          message: 'Error al ejecutar el job',
          error: result.error,
        };
      }
    } catch (error) {
      if (error instanceof JobNotFoundError) {
        throw new NotFoundException({
          message: error.message,
          jobIndex: error.jobIndex,
        });
      }
      if (error instanceof CronServiceError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }
}

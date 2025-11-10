import {
  Controller,
  Get,
  Post,
  Param,
  ParseIntPipe,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { CronService } from './cron.service';

@Controller('cron')
export class CronController {
  constructor(private readonly cronService: CronService) {}

  @Get('health')
  getHealth(): {
    status: string;
    service: string;
    timestamp: string;
    uptime: number;
  } {
    return {
      status: 'ok',
      service: 'ElBetaso Cron Jobs',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  @Get('jobs')
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
    const jobs = this.cronService.getJobsList();
    return {
      totalJobs: jobs.length,
      jobs,
    };
  }

  @Get('jobs/:index')
  getJobStatus(@Param('index', ParseIntPipe) index: number): {
    running: boolean;
    lastDate: string | null;
    nextDate: string | null;
  } {
    try {
      return this.cronService.getJobStatus(index);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Error desconocido';
      throw new HttpException(message, HttpStatus.NOT_FOUND);
    }
  }

  @Post('execute/:index')
  async executeJob(@Param('index', ParseIntPipe) index: number): Promise<{
    success: boolean;
    message: string;
    result?: unknown;
    error?: string;
  }> {
    try {
      const result = await this.cronService.executeJobManually(index);

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
      const message =
        error instanceof Error ? error.message : 'Error desconocido';
      throw new HttpException(
        {
          success: false,
          message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

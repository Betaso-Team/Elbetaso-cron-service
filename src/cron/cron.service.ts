import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { firstValueFrom } from 'rxjs';
import { AxiosError, AxiosResponse } from 'axios';
import { cronJobsConfig, CronJobConfig } from '../config/cron-jobs.config';

interface JobExecutionResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

@Injectable()
export class CronService implements OnModuleInit {
  private readonly logger = new Logger(CronService.name);
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly cronJobs: CronJobConfig[] = cronJobsConfig;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {
    this.apiKey = this.configService.get<string>('API_KEY') ?? '';
    this.baseUrl = this.configService.get<string>('BASE_URL') ?? '';
  }

  onModuleInit(): void {
    this.initializeCronJobs();
  }

  private initializeCronJobs(): void {
    this.logger.log('🚀 Inicializando cron jobs...\n');

    this.cronJobs.forEach((jobConfig, index) => {
      if (jobConfig.enabled === false) {
        this.logger.warn(`⏭️  Saltando (deshabilitado): ${jobConfig.name}`);
        return;
      }

      try {
        const job = new CronJob(jobConfig.schedule, () => {
          void this.executeEndpoint(jobConfig.name, jobConfig.endpoint);
        });

        this.schedulerRegistry.addCronJob(`job-${index}`, job);
        job.start();

        this.logger.log(
          `⏰ Configurado: ${jobConfig.name} (${jobConfig.schedule})`,
        );
      } catch (error) {
        this.logger.error(
          `❌ Error al configurar ${jobConfig.name}: ${this.getErrorMessage(error)}`,
        );
      }
    });

    this.logger.log(
      `\n✅ Total de cron jobs configurados: ${this.cronJobs.filter((j) => j.enabled !== false).length}\n`,
    );
  }

  private async executeEndpoint(
    name: string,
    endpoint: string,
  ): Promise<JobExecutionResult> {
    const fullUrl = `${this.baseUrl}${endpoint}`;

    try {
      this.logger.log(`🔄 [${new Date().toISOString()}] Ejecutando: ${name}`);

      const response: AxiosResponse = await firstValueFrom(
        this.httpService.get(fullUrl, {
          headers: {
            accept: '*/*',
            'X-Internal-Api-Key': this.apiKey,
          },
          timeout: 30000,
        }),
      );

      this.logger.log(
        `✅ [${new Date().toISOString()}] Completado: ${name} - Status: ${response.status}`,
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      const errorMessage = this.getErrorMessage(error);

      this.logger.error(
        `❌ [${new Date().toISOString()}] Error en ${name}: ${errorMessage}`,
      );

      if (this.isAxiosError(error)) {
        this.logger.error(`   Status: ${error.response?.status ?? 'N/A'}`);
        this.logger.error(
          `   Data: ${JSON.stringify(error.response?.data ?? {})}`,
        );
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  // Type guard para AxiosError
  private isAxiosError(error: unknown): error is AxiosError {
    return (
      typeof error === 'object' &&
      error !== null &&
      'isAxiosError' in error &&
      (error as AxiosError).isAxiosError === true
    );
  }

  // Helper para extraer mensaje de error de forma segura
  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === 'string') {
      return error;
    }
    return 'Error desconocido';
  }

  // Método público para ejecutar un job manualmente
  async executeJobManually(jobIndex: number): Promise<JobExecutionResult> {
    if (jobIndex < 0 || jobIndex >= this.cronJobs.length) {
      throw new Error('Job index inválido');
    }

    const job = this.cronJobs[jobIndex];
    this.logger.log(`🔧 Ejecución manual solicitada: ${job.name}`);

    return await this.executeEndpoint(job.name, job.endpoint);
  }

  // Método para obtener la lista de jobs
  getJobsList(): Array<{
    index: number;
    name: string;
    schedule: string;
    endpoint: string;
    enabled: boolean;
  }> {
    return this.cronJobs.map((job, index) => ({
      index,
      name: job.name,
      schedule: job.schedule,
      endpoint: job.endpoint,
      enabled: job.enabled !== false,
    }));
  }

  // Método para obtener el estado de un job específico
  getJobStatus(jobIndex: number): {
    running: boolean;
    lastDate: string | null;
    nextDate: string | null;
  } {
    try {
      const job = this.schedulerRegistry.getCronJob(`job-${jobIndex}`);
      const lastDate = job.lastDate();
      const nextDate = job.nextDate();

      return {
        running: (job as unknown as { running: boolean }).running,
        lastDate: lastDate ? lastDate.toString() : null,
        nextDate: nextDate ? nextDate.toString() : null,
      };
    } catch (error) {
      throw new Error(
        `Job con índice ${jobIndex} no encontrado: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      );
    }
  }
}

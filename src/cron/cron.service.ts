import { Injectable, OnModuleInit } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { firstValueFrom } from 'rxjs';
import { AxiosError, AxiosResponse } from 'axios';

import { JOB_CONFIGS, JobConfig } from './job.config';
import { LoggerBuilder, LoggerService } from '../logger';
import { EnvService } from '../env';
import { JobNotFoundError } from './cron.errors';

interface JobExecutionResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

@Injectable()
export class CronService implements OnModuleInit {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private jobConfigs: JobConfig[] = [...JOB_CONFIGS];
  private readonly logger: LoggerService;

  constructor(
    private readonly httpService: HttpService,
    private readonly envService: EnvService,
    private readonly schedulerRegistry: SchedulerRegistry,
    loggerBuilder: LoggerBuilder,
  ) {
    this.apiKey = this.envService.get('API_KEY');
    this.baseUrl = this.envService.get('BASE_URL');
    this.logger = loggerBuilder.buildWithContext(CronService.name);
  }

  onModuleInit(): void {
    this.initializeJobs();
  }

  private initializeJobs(): void {
    this.logger.log('🚀 Inicializando cron jobs...\n');

    const successfulJobs: JobConfig[] = [];
    this.jobConfigs.forEach((cronJobConfig, index) => {
      if (cronJobConfig.enabled === false) {
        this.logger.log(`⏭️  Saltando (deshabilitado): ${cronJobConfig.name}`);
        return;
      }

      try {
        const job = new CronJob(cronJobConfig.schedule, async () => {
          await this.startJob(cronJobConfig.name, cronJobConfig.urlPath);
        });

        this.schedulerRegistry.addCronJob(`job-${index}`, job);
        job.start();

        this.logger.log(
          `⏰ Configurado: ${cronJobConfig.name} (${cronJobConfig.schedule})`,
        );
        successfulJobs.push(cronJobConfig);
      } catch (error) {
        this.logger.warn(
          `❌ Error al configurar ${cronJobConfig.name}: ${this.getErrorMessage(error)}`,
        );
      }
    });

    // Solo mantener los jobs que se configuraron exitosamente
    this.jobConfigs = successfulJobs;
    this.logger.log(
      `\n✅ Total de cron jobs configurados: ${this.jobConfigs.length}\n`,
    );
  }

  private async startJob(
    jobName: string,
    urlPath: string,
  ): Promise<JobExecutionResult> {
    const fullUrl = `${this.baseUrl}${urlPath}`;

    try {
      this.logger.log(
        `🔄 [${new Date().toISOString()}] Ejecutando: ${jobName}`,
      );

      const response: AxiosResponse = await firstValueFrom(
        this.httpService.get(fullUrl, {
          headers: {
            accept: '*/*',
            'x-internal-api-key': this.apiKey,
          },
          timeout: 30000,
        }),
      );
      this.logger.log(
        `✅ [${new Date().toISOString()}] Completado: ${jobName} - Status: ${response.status}`,
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      const errorMessage = this.getErrorMessage(error);
      this.logger.warn(
        `❌ [${new Date().toISOString()}] Error en ${jobName}: ${errorMessage}`,
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

  /**
   * Ejecuta un job manualmente por su índice
   *
   * @param jobIndex - El índice del job en la lista de configuración (0-based)
   * @returns Promise con el resultado de la ejecución del job
   * @throws {JobNotFoundError} Si el job con el índice especificado no existe
   *
   * @example
   * ```typescript
   * const result = await cronService.startJobManually(0);
   * if (result.success) {
   *   console.log('Job ejecutado exitosamente', result.data);
   * } else {
   *   console.error('Job falló', result.error);
   * }
   * ```
   */
  async startJobManually(jobIndex: number): Promise<JobExecutionResult> {
    const job = this.jobConfigs[jobIndex];
    if (!job) {
      throw new JobNotFoundError(jobIndex);
    }
    this.logger.log(`🔧 Ejecución manual solicitada: ${job.name}`);

    return await this.startJob(job.name, job.urlPath);
  }

  /**
   * Obtiene la lista de todos los jobs configurados exitosamente
   *
   * @returns Array con la información de cada job (índice, nombre, schedule, endpoint, estado)
   *
   * @remarks
   * Solo incluye jobs que se inicializaron correctamente.
   * Jobs deshabilitados o que fallaron durante la inicialización no aparecen en esta lista.
   *
   * @example
   * ```typescript
   * const jobs = cronService.getJobList();
   * console.log(`Total de jobs: ${jobs.length}`);
   * jobs.forEach(job => console.log(`${job.index}: ${job.name}`));
   * ```
   */
  getJobList(): Array<{
    index: number;
    name: string;
    schedule: string;
    endpoint: string;
    enabled: boolean;
  }> {
    return this.jobConfigs.map((job, index) => ({
      index,
      name: job.name,
      schedule: job.schedule,
      endpoint: job.urlPath,
      enabled: job.enabled !== false,
    }));
  }

  /**
   * Obtiene el estado actual de un job específico
   *
   * @param jobIndex - El índice del job en la lista de configuración (0-based)
   * @returns Objeto con el estado del job (running, lastDate, nextDate)
   * @throws {JobNotFoundError} Si el job con el índice especificado no existe
   *
   * @remarks
   * - `running`: Indica si el job está actualmente en ejecución
   * - `lastDate`: Fecha/hora de la última ejecución (null si nunca se ejecutó)
   * - `nextDate`: Fecha/hora de la próxima ejecución programada
   *
   * @example
   * ```typescript
   * try {
   *   const status = cronService.getJobStatus(0);
   *   console.log('Job running:', status.running);
   *   console.log('Next execution:', status.nextDate);
   * } catch (error) {
   *   if (error instanceof JobNotFoundError) {
   *     console.error('Job no encontrado');
   *   }
   * }
   * ```
   */
  getJobStatus(jobIndex: number): {
    running: boolean;
    lastDate: string | null;
    nextDate: string | null;
  } {
    const jobConfig = this.jobConfigs[jobIndex];
    if (!jobConfig) {
      throw new JobNotFoundError(jobIndex);
    }

    const job = this.schedulerRegistry.getCronJob(`job-${jobIndex}`);
    const lastDate = job.lastDate();
    const nextDate = job.nextDate();

    return {
      running: (job as unknown as { running: boolean }).running,
      lastDate: lastDate ? lastDate.toString() : null,
      nextDate: nextDate ? nextDate.toString() : null,
    };
  }
}

/**
 * Error base para errores de negocio del servicio de cron
 */
export abstract class CronServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

/**
 * Error cuando un job no se encuentra
 */
export class JobNotFoundError extends CronServiceError {
  constructor(public readonly jobIndex: number) {
    super(`Job con indice ${jobIndex} no encontrado`);
  }
}

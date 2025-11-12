import { Injectable } from '@nestjs/common';
import { z } from 'zod';

export class InvalidEnvError extends Error {
  constructor(
    message: string,
    public readonly issues: z.ZodIssue[],
  ) {
    super(message);
    this.name = 'InvalidEnvError';
  }
}

/**
 * Schema de validacion para las variables de entorno
 */
const envSchema = z.object({
  PORT: z.coerce
    .number()
    .int('PORT debe ser un numero entero')
    .positive('PORT debe ser un numero positivo')
    .max(65535, 'PORT debe ser menor o igual a 65535')
    .default(3000),

  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  LOG_LEVEL: z
    .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace'])
    .default('debug'),

  API_KEY: z.string().min(1, 'API_KEY no puede estar vacio'),

  BASE_URL: z.string().url('BASE_URL debe ser una URL valida'),
});

/**
 * Tipo inferido del schema de validacion
 */
export type Env = z.infer<typeof envSchema>;

/**
 * Servicio para validar y proveer acceso a las variables de entorno
 */
@Injectable()
export class EnvService {
  private readonly env: Env;

  constructor() {
    this.env = this.validateEnv();
  }

  /**
   * Valida y parsea las variables de entorno
   * @throws {InvalidEnvError} Si las variables de entorno no son validas
   */
  private validateEnv(): Env {
    const result = envSchema.safeParse(process.env);

    if (!result.success) {
      throw new InvalidEnvError(
        'Configuracion de entorno invalida',
        result.error.issues,
      );
    }

    return result.data;
  }

  /**
   * Obtiene un valor de configuracion de forma type-safe
   * @param key Clave de configuracion
   * @returns Valor de configuracion correspondiente
   */
  get<K extends keyof Env>(key: K): Env[K] {
    return this.env[key];
  }
}

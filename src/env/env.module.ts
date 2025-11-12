import { Global, Module } from '@nestjs/common';
import { EnvService } from './env.service';

/**
 * Modulo global de variables de entorno
 * Se marca como Global para que EnvService este disponible en toda la aplicacion
 */
@Global()
@Module({
  providers: [EnvService],
  exports: [EnvService],
})
export class EnvModule {}

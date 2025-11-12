import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { CronModule } from './cron/cron.module';
import { EnvModule } from './env';
import { LoggerModule } from './logger';

@Module({
  imports: [EnvModule, LoggerModule, ScheduleModule.forRoot(), CronModule],
})
export class AppModule {}

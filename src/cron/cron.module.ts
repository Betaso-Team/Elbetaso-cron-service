import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CronService } from './cron.service';
import { CronController } from './cron.controller';

@Module({
  imports: [
    HttpModule.register({
      timeout: 30000,
      maxRedirects: 5,
    }),
  ],
  controllers: [CronController],
  providers: [CronService],
})
export class CronModule {}

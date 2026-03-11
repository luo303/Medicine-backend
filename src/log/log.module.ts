import { Module } from '@nestjs/common';
import { LogController } from './log.controller';
import { LogService } from './log.service';
import { logProviders } from './log.providers';
import { DatabaseModule } from 'src/dto/database.module';
@Module({
  imports: [DatabaseModule],
  controllers: [LogController],
  providers: [LogService, ...logProviders],
  exports: [LogService],
})
export class LogModule {}

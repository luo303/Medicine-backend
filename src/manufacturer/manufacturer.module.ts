import { Module } from '@nestjs/common';
import { ManufacturerService } from './manufacturer.service';
import { ManufacturerController } from './manufacturer.controller';

@Module({
  providers: [ManufacturerService],
  controllers: [ManufacturerController],
})
export class ManufacturerModule {}

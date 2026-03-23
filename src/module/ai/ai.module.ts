import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { DrugModule } from '../basic/drug/drug.module';
import { WarehouseModule } from '../basic/warehouse/warehouse.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inventory } from '@/entity/Inventory';

@Module({
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService],
  imports: [DrugModule, WarehouseModule, TypeOrmModule.forFeature([Inventory])],
})
export class AiModule {}

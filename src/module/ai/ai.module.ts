import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { DrugModule } from '../basic/drug/drug.module';
import { WarehouseModule } from '../basic/warehouse/warehouse.module';
import { ManufacturerService } from '../basic/manufacturer/manufacturer.service';
import { MedicalInstitutionService } from '../basic/MedicalInstitution/MedicalInstitution.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inventory } from '@/entity/Inventory';
import { Manufacturer } from '@/entity/Manufacturer';
import { MedicalInstitution } from '@/entity/MedicalInstitution';
import { PurchaseOrder } from '@/entity/PurchaseOrder';
import { SalesOrder } from '@/entity/SalesOrder';
import { StorageLocation } from '@/entity/StorageLocation';

@Module({
  controllers: [AiController],
  providers: [AiService, ManufacturerService, MedicalInstitutionService],
  exports: [AiService],
  imports: [
    DrugModule,
    WarehouseModule,
    TypeOrmModule.forFeature([
      Inventory,
      Manufacturer,
      MedicalInstitution,
      PurchaseOrder,
      SalesOrder,
      StorageLocation,
    ]),
  ],
})
export class AiModule {}

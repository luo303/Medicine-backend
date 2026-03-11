import { Module } from '@nestjs/common';
import { ManufacturerModule } from './manufacturer/manufacturer.module';
import { MedicalInstitutionModule } from './MedicalInstitution/MedicalInstitution.module';
import { DrugModule } from './drug/drug.module';
import { WarehouseModule } from './warehouse/warehouse.module';

@Module({
  imports: [
    ManufacturerModule,
    MedicalInstitutionModule,
    DrugModule,
    WarehouseModule,
  ],
})
export class BasicModule {}

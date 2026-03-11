import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configload from './configuration';
// import { APP_FILTER } from '@nestjs/core';
// import { HttpExceptionFilter } from './filters/http-exception.filter';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TransformInterceptor } from './interceptor/transform.interceptor';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Drug } from './entitys/Drug';
import { PurchaseDetail } from './entitys/PurchaseDetail';
import { PurchaseStorage } from './entitys/PurchaseStorage';
import { PurchaseOrder } from './entitys/PurchaseOrder';
import { SalesDetail } from './entitys/SalesDetail';
import { SalesOutbound } from './entitys/SalesOutbound';
import { SalesOrder } from './entitys/SalesOrder';
import { Inventory } from './entitys/Inventory';
import { Warehouse } from './entitys/Warehouse';
import { Manufacturer } from './entitys/Manufacturer';
import { MedicalInstitution } from './entitys/MedicalInstitution';
import { StorageLocation } from './entitys/StorageLocation';
import { ManufacturerModule } from './manufacturer/manufacturer.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // envFilePath,
      load: [configload],
      ignoreEnvFile: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'example',
      database: 'medicine',
      entities: [
        Drug,
        PurchaseDetail,
        PurchaseStorage,
        PurchaseOrder,
        SalesDetail,
        SalesOutbound,
        SalesOrder,
        Inventory,
        Warehouse,
        Manufacturer,
        MedicalInstitution,
        StorageLocation,
      ],
      synchronize: true,
    }),
    ManufacturerModule,
  ],
  controllers: [],
  providers: [
    // {
    //   provide: APP_FILTER,
    //   useClass: HttpExceptionFilter,
    // },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule {}

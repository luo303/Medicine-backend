import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import configload from './configuration';
// import { APP_FILTER } from '@nestjs/core';
// import { HttpExceptionFilter } from './filters/http-exception.filter';
import { AuthModule } from './auth/auth.module';
import { AuthGuard } from './auth/auth.guard';
import { APP_GUARD } from '@nestjs/core';
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
import { User } from './user/user.entity';

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
      database: 'testdb',
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
        User,
      ],
      synchronize: true,
    }),
    UserModule,
    AuthModule,
  ],
  controllers: [],
  providers: [
    // {
    //   provide: APP_FILTER,
    //   useClass: HttpExceptionFilter,
    // },
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule {}

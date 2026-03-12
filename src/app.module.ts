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
import { Drug } from './entity/Drug';
import { PurchaseDetail } from './entity/PurchaseDetail';
import { PurchaseStorage } from './entity/PurchaseStorage';
import { PurchaseOrder } from './entity/PurchaseOrder';
import { SalesDetail } from './entity/SalesDetail';
import { SalesOutbound } from './entity/SalesOutbound';
import { SalesOrder } from './entity/SalesOrder';
import { Inventory } from './entity/Inventory';
import { Warehouse } from './entity/Warehouse';
import { Manufacturer } from './entity/Manufacturer';
import { MedicalInstitution } from './entity/MedicalInstitution';
import { StorageLocation } from './entity/StorageLocation';
import { BasicModule } from './module/basic/basic.module';
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
      synchronize: false,
    }),
    BasicModule,
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

import { DataSource, DataSourceOptions } from 'typeorm';

import { Drug } from './src/entity/Drug';
import { PurchaseDetail } from './src/entity/PurchaseDetail';
import { PurchaseStorage } from './src/entity/PurchaseStorage';
import { PurchaseOrder } from './src/entity/PurchaseOrder';
import { SalesDetail } from './src/entity/SalesDetail';
import { SalesOutbound } from './src/entity/SalesOutbound';
import { SalesOrder } from './src/entity/SalesOrder';
import { Inventory } from './src/entity/Inventory';
import { Warehouse } from './src/entity/Warehouse';
import { Manufacturer } from './src/entity/Manufacturer';
import { MedicalInstitution } from './src/entity/MedicalInstitution';
import { StorageLocation } from './src/entity/StorageLocation';
import { User } from './src/user/user.entity';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const basic = {
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
    User,
  ],
  synchronize: false,
} as TypeOrmModuleOptions;
export default new DataSource({
  ...basic,
  migrations: ['src/migrations/**/*{.ts,.js}'],
} as DataSourceOptions);

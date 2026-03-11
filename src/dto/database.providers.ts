import { DataSource } from 'typeorm';
import { Log } from '../log/log.entity';
import { User } from '../user/user.entity';
import { Roles } from '../roles/roles.entity';
import { Profile } from '../user/profile.entity';
export const databaseProviders = [
  {
    provide: 'DATA_SOURCE',
    useFactory: async () => {
      const dataSource = new DataSource({
        type: 'mysql',
        host: 'localhost',
        port: 3306,
        username: 'root',
        password: 'example',
        database: 'testdb',
        entities: [Log, User, Roles, Profile],
        synchronize: true,
        logging: process.env.NODE_ENV === 'development',
      });
      console.log(__dirname);

      return dataSource.initialize();
    },
  },
];

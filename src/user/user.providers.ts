import { DataSource } from 'typeorm';
import { User } from './user.entity';
import { TOKENS } from '../../contain';

export const userProviders = [
  {
    provide: TOKENS.USER_REPOSITORY,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(User),
    inject: [TOKENS.DATA_SOURCE],
  },
];

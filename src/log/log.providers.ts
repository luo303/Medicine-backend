import { DataSource } from 'typeorm';
import { Log } from './log.entity';
import { TOKENS } from '../../contain';

export const logProviders = [
  {
    provide: TOKENS.LOG_REPOSITORY,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Log),
    inject: [TOKENS.DATA_SOURCE],
  },
];

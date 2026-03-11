import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Log } from './log.entity';
import { TOKENS } from '../../contain';
import { Inject } from '@nestjs/common';

@Injectable()
export class LogService {
  constructor(
    @Inject(TOKENS.LOG_REPOSITORY)
    private readonly logsRepository: Repository<Log>,
  ) {}

  async findLogsByGroup(id: number) {
    const logs = await this.logsRepository
      .createQueryBuilder('log')
      .select('log.result', 'result')
      .addSelect('COUNT(log.result)', 'count')
      .leftJoinAndSelect('log.user', 'user')
      .where('user.id = :id', { id })
      .groupBy('log.result')
      .orderBy('count', 'DESC')
      .addOrderBy('result', 'DESC')
      .offset(1)
      .limit(2)
      .getRawMany();
    return logs as { result: string; count: string }[];
  }
}

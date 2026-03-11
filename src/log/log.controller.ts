import { Controller } from '@nestjs/common';
import { LogService } from './log.service';
import { Get } from '@nestjs/common';

@Controller('log')
export class LogController {
  constructor(private readonly logService: LogService) {}
  @Get('/logsByGroup')
  async getLogs(): Promise<any> {
    const logs = await this.logService.findLogsByGroup(1);
    return logs.map((item) => ({
      result: item.result,
      count: Number(item.count),
    }));
  }
}

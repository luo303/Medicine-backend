import { Controller, Get } from '@nestjs/common';
import { DrugService } from './drug.service';
@Controller('drug')
export class DrugController {
  constructor(private readonly drugService: DrugService) {}
  @Get()
  async findAll() {
    const drugs = await this.drugService.findAll();
    return {
      data: drugs,
      message: '获取药品列表成功',
    };
  }
}

import { Controller, Get } from '@nestjs/common';
import { ManufacturerService } from './manufacturer.service';

@Controller('manufacturer')
export class ManufacturerController {
  constructor(private readonly manufacturerService: ManufacturerService) {}
  @Get()
  async findAll() {
    const manufacturers = await this.manufacturerService.findAll();
    return {
      data: manufacturers,
      message: '获取制造商列表成功',
    };
  }
}

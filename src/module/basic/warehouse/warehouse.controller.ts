import { Controller, Get } from '@nestjs/common';
import { WarehouseService } from './warehouse.service';
@Controller('warehouse')
export class WarehouseController {
  constructor(private readonly warehouseService: WarehouseService) {}
  @Get()
  async findAll() {
    const warehouses = await this.warehouseService.findAll();
    return {
      data: warehouses,
      message: '获取仓库列表成功',
    };
  }
}

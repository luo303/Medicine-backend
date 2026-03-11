import { Controller, Get } from '@nestjs/common';
import { ManufacturerService } from './manufacturer.service';

@Controller('manufacturer')
export class ManufacturerController {
  constructor(private readonly manufacturerService: ManufacturerService) {}
  @Get()
  findAll() {
    return this.manufacturerService.findAll();
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Warehouse } from '@/entity/Warehouse';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';

@Injectable()
export class WarehouseService {
  constructor(
    @InjectRepository(Warehouse)
    private readonly warehouseRepository: Repository<Warehouse>,
  ) {}

  async findAll() {
    const warehouses = await this.warehouseRepository.find();
    return warehouses;
  }

  // 根据 ID 查询仓库
  async findOne(id: number) {
    return this.warehouseRepository.findOne({ where: { id } });
  }

  // 根据编号查询仓库
  async findByCode(code: string) {
    return this.warehouseRepository.findOne({ where: { code } });
  }

  // 新增仓库
  async create(createDto: CreateWarehouseDto) {
    const warehouse = this.warehouseRepository.create(createDto);
    return this.warehouseRepository.save(warehouse);
  }

  // 更新仓库
  async update(id: number, updateDto: UpdateWarehouseDto) {
    await this.warehouseRepository.update(id, updateDto);
    return this.findOne(id);
  }

  // 删除仓库
  async remove(id: number) {
    const warehouse = await this.findOne(id);
    if (warehouse) {
      await this.warehouseRepository.remove(warehouse);
      return true;
    }
    return false;
  }
}

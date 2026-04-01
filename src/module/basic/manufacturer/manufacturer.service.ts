import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Manufacturer } from '@/entity/Manufacturer';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateManufacturerDto } from './dto/create-manufacturer.dto';
import { UpdateManufacturerDto } from './dto/update-manufacturer.dto';

@Injectable()
export class ManufacturerService {
  constructor(
    @InjectRepository(Manufacturer)
    private readonly manufacturerRepository: Repository<Manufacturer>,
  ) {}

  async findAll(): Promise<Manufacturer[]> {
    const manufacturers = await this.manufacturerRepository.find();
    return manufacturers;
  }

  // 根据批准号查询生产企业
  async findOne(approval_no: string): Promise<Manufacturer | null> {
    return this.manufacturerRepository.findOne({ where: { approval_no } });
  }

  // 新增生产企业
  async create(createDto: CreateManufacturerDto): Promise<Manufacturer> {
    const manufacturer = this.manufacturerRepository.create(createDto);
    return this.manufacturerRepository.save(manufacturer);
  }

  // 更新生产企业
  async update(
    approval_no: string,
    updateDto: UpdateManufacturerDto,
  ): Promise<Manufacturer | null> {
    await this.manufacturerRepository.update(approval_no, updateDto);
    return this.findOne(approval_no);
  }

  // 删除生产企业
  async remove(approval_no: string): Promise<boolean> {
    const manufacturer = await this.findOne(approval_no);
    if (manufacturer) {
      await this.manufacturerRepository.remove(manufacturer);
      return true;
    }
    return false;
  }
}

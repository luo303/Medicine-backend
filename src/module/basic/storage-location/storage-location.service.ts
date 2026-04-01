import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StorageLocation } from '@/entity/StorageLocation';
import { CreateStorageLocationDto } from './dto/create-storage-location.dto';
import { UpdateStorageLocationDto } from './dto/update-storage-location.dto';

@Injectable()
export class StorageLocationService {
  constructor(
    @InjectRepository(StorageLocation)
    private readonly storageLocationRepository: Repository<StorageLocation>,
  ) {}

  // 查询所有货位
  findAll() {
    return this.storageLocationRepository.find({ relations: ['warehouse'] });
  }

  // 根据 ID 查询货位
  findOne(id: number) {
    return this.storageLocationRepository.findOne({
      where: { id },
      relations: ['warehouse'],
    });
  }

  // 创建货位
  create(createDto: CreateStorageLocationDto) {
    const storageLocation = this.storageLocationRepository.create(createDto);
    return this.storageLocationRepository.save(storageLocation);
  }

  // 更新货位
  async update(id: number, updateDto: UpdateStorageLocationDto) {
    await this.storageLocationRepository.update(id, updateDto);
    return this.findOne(id);
  }

  // 删除货位
  async remove(id: number) {
    const storageLocation = await this.findOne(id);
    if (storageLocation) {
      await this.storageLocationRepository.remove(storageLocation);
      return true;
    }
    return false;
  }
}

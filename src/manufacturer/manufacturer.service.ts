import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Manufacturer } from '../entitys/Manufacturer';
import { InjectRepository } from '@nestjs/typeorm';

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
}

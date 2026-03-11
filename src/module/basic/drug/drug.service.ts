import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Drug } from '@/entity/Drug';
@Injectable()
export class DrugService {
  constructor(
    @InjectRepository(Drug)
    private readonly drugRepository: Repository<Drug>,
  ) {}
  // 查询所有药品
  async findAll() {
    const drugs = await this.drugRepository.find();
    return drugs;
  }
}

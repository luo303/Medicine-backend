import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MedicalInstitution } from '@/entity/MedicalInstitution';
import { Repository } from 'typeorm';

@Injectable()
export class MedicalInstitutionService {
  constructor(
    @InjectRepository(MedicalInstitution)
    private readonly medicalInstitutionRepository: Repository<MedicalInstitution>,
  ) {}
  // 查询所有医疗机构
  findAll() {
    return this.medicalInstitutionRepository.find();
  }
}

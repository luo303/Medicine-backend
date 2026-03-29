import { Controller, Get } from '@nestjs/common';
import { MedicalInstitutionService } from './MedicalInstitution.service';

@Controller('MedicalInstitution')
export class MedicalInstitutionController {
  constructor(
    private readonly medicalInstitutionService: MedicalInstitutionService,
  ) {}
  @Get()
  async findAll() {
    const medicalInstitutions = await this.medicalInstitutionService.findAll();
    return {
      data: medicalInstitutions,
      message: '获取医疗机构列表成功',
    };
  }
}

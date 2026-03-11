import { Controller, Get } from '@nestjs/common';
import { MedicalInstitutionService } from './MedicalInstitution.service';

@Controller('MedicalInstitution')
export class MedicalInstitutionController {
  constructor(
    private readonly medicalInstitutionService: MedicalInstitutionService,
  ) {}
  @Get()
  findAll() {
    return this.medicalInstitutionService.findAll();
  }
}

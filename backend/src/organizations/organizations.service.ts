import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from '../entities/organization.entity';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
  ) {}

  async create(createOrganizationDto: any) {
    const organization = this.organizationRepository.create(createOrganizationDto);
    return this.organizationRepository.save(organization);
  }

  async findAll() {
    return this.organizationRepository.find({
      relations: ['parent', 'children', 'users'],
    });
  }

  async findOne(id: number) {
    const organization = await this.organizationRepository.findOne({
      where: { id },
      relations: ['parent', 'children', 'users'],
    });
    
    if (!organization) {
      throw new NotFoundException('Organization not found');
    }
    
    return organization;
  }

  async update(id: number, updateOrganizationDto: any) {
    const organization = await this.findOne(id);
    Object.assign(organization, updateOrganizationDto);
    return this.organizationRepository.save(organization);
  }

  async remove(id: number): Promise<void> {
    const organization = await this.findOne(id);
    await this.organizationRepository.remove(organization);
  }
}

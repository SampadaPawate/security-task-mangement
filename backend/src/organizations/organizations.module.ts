import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organization } from '../entities/organization.entity';
import { OrganizationsService } from './organizations.service';
import { OrganizationsController } from './organizations.controller';
import { RbacService } from '../auth/rbac.service';
import { AuditService } from '../auth/audit.service';
import { PermissionsGuard } from '../auth/guards/permissions.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Organization])],
  controllers: [OrganizationsController],
  providers: [OrganizationsService, RbacService, AuditService, PermissionsGuard],
})
export class OrganizationsModule {}


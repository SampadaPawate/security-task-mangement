import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from '../entities/audit-log.entity';
import { AuditController } from './audit.controller';
import { AuditService } from '../auth/audit.service';
import { RbacService } from '../auth/rbac.service';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { User } from '../entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AuditLog, User])],
  controllers: [AuditController],
  providers: [AuditService, RbacService, PermissionsGuard],
  exports: [AuditService],
})
export class AuditModule {}

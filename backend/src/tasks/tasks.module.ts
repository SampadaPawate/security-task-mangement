import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from '../entities/task.entity';
import { User } from '../entities/user.entity';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { RbacService } from '../auth/rbac.service';
import { AuditService } from '../auth/audit.service';
import { PermissionsGuard } from '../auth/guards/permissions.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Task, User])],
  controllers: [TasksController],
  providers: [TasksService, RbacService, AuditService, PermissionsGuard],
})
export class TasksModule {}

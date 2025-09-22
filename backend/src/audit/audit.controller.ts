import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { Permission } from '../auth/rbac.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('audit-log')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AuditController {
  constructor() {}

  @Get()
  @Permissions(Permission.READ_AUDIT_LOG)
  async getAuditLogs(@CurrentUser() user: any) {
    // In a real implementation, this would fetch from database
    // For now, return sample audit logs
    return {
      message: 'Audit logs retrieved successfully',
      user: user.email,
      logs: [
        {
          id: 1,
          action: 'login',
          resource: 'user',
          userId: user.id,
          timestamp: new Date().toISOString(),
          ipAddress: '127.0.0.1',
          details: 'User logged in successfully'
        },
        {
          id: 2,
          action: 'create',
          resource: 'task',
          userId: user.id,
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          ipAddress: '127.0.0.1',
          details: 'Task "Sample Task" was created'
        }
      ]
    };
  }
}


import { Injectable } from '@nestjs/common';
import { AuditLog, AuditAction } from '../entities/audit-log.entity';

@Injectable()
export class AuditService {
  async log(
    action: AuditAction,
    resource: string,
    resourceId?: number,
    oldValues?: any,
    newValues?: any,
    userId?: number,
    ipAddress?: string,
    userAgent?: string,
    details?: string,
  ): Promise<void> {
    const auditEntry = {
      action,
      resource,
      resourceId,
      oldValues: oldValues ? JSON.stringify(oldValues) : null,
      newValues: newValues ? JSON.stringify(newValues) : null,
      userId,
      ipAddress,
      userAgent,
      details,
      createdAt: new Date(),
    };

    // In a real implementation, this would save to database
    // For now, we'll log to console
    console.log('AUDIT LOG:', JSON.stringify(auditEntry, null, 2));
  }

  async logAccess(userId: number, resource: string, resourceId?: number, ipAddress?: string): Promise<void> {
    await this.log(
      AuditAction.READ,
      resource,
      resourceId,
      undefined,
      undefined,
      userId,
      ipAddress,
      undefined,
      `User accessed ${resource}${resourceId ? ` with ID ${resourceId}` : ''}`,
    );
  }

  async logPermissionDenied(userId: number, resource: string, action: string, ipAddress?: string): Promise<void> {
    await this.log(
      AuditAction.PERMISSION_DENIED,
      resource,
      undefined,
      undefined,
      undefined,
      userId,
      ipAddress,
      undefined,
      `Permission denied for ${action} on ${resource}`,
    );
  }
}


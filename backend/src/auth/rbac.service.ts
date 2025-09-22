import { Injectable } from '@nestjs/common';
import { Role } from '../entities/user.entity';

export enum Permission {
  // User permissions
  CREATE_USER = 'create_user',
  READ_USER = 'read_user',
  UPDATE_USER = 'update_user',
  DELETE_USER = 'delete_user',
  
  // Organization permissions
  CREATE_ORGANIZATION = 'create_organization',
  READ_ORGANIZATION = 'read_organization',
  UPDATE_ORGANIZATION = 'update_organization',
  DELETE_ORGANIZATION = 'delete_organization',
  
  // Task permissions
  CREATE_TASK = 'create_task',
  READ_TASK = 'read_task',
  UPDATE_TASK = 'update_task',
  DELETE_TASK = 'delete_task',
  
  // Audit permissions
  READ_AUDIT_LOG = 'read_audit_log'
}

@Injectable()
export class RbacService {
  private readonly rolePermissions: Record<Role, Permission[]> = {
    [Role.OWNER]: [
      Permission.CREATE_USER,
      Permission.READ_USER,
      Permission.UPDATE_USER,
      Permission.DELETE_USER,
      Permission.CREATE_ORGANIZATION,
      Permission.READ_ORGANIZATION,
      Permission.UPDATE_ORGANIZATION,
      Permission.DELETE_ORGANIZATION,
      Permission.CREATE_TASK,
      Permission.READ_TASK,
      Permission.UPDATE_TASK,
      Permission.DELETE_TASK,
      Permission.READ_AUDIT_LOG,
    ],
    [Role.ADMIN]: [
      Permission.CREATE_USER,
      Permission.READ_USER,
      Permission.UPDATE_USER,
      Permission.READ_ORGANIZATION,
      Permission.CREATE_TASK,
      Permission.READ_TASK,
      Permission.UPDATE_TASK,
      Permission.DELETE_TASK,
    ],
    [Role.VIEWER]: [
      Permission.READ_USER,
      Permission.READ_ORGANIZATION,
      Permission.READ_TASK,
      Permission.CREATE_TASK,
    ],
  };

  hasPermission(userRole: string, requiredPermissions: Permission[]): boolean {
    const userPermissions = this.rolePermissions[userRole as Role] || [];
    
    return requiredPermissions.every(permission => 
      userPermissions.includes(permission)
    );
  }

  getPermissionsForRole(role: string): Permission[] {
    return this.rolePermissions[role as Role] || [];
  }

  canAccessOrganization(userRole: string, userOrgId: number, targetOrgId: number): boolean {
    // Owners can access their organization and all child organizations
    if (userRole === Role.OWNER) {
      return userOrgId === targetOrgId || true; // Simplified for now
    }
    
    // Admins and Viewers can only access their own organization
    return userOrgId === targetOrgId;
  }

  canAccessTask(userRole: string, userOrgId: number, taskCreatorOrgId: number): boolean {
    return this.canAccessOrganization(userRole, userOrgId, taskCreatorOrgId);
  }
}

import { Test, TestingModule } from '@nestjs/testing';
import { RbacService, Permission } from './rbac.service';
import { Role } from '../entities/user.entity';

describe('RbacService', () => {
  let service: RbacService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RbacService],
    }).compile();

    service = module.get<RbacService>(RbacService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('hasPermission', () => {
    it('should return true for owner with any permission', () => {
      expect(service.hasPermission(Role.OWNER, [Permission.CREATE_TASK])).toBe(true);
      expect(service.hasPermission(Role.OWNER, [Permission.DELETE_USER])).toBe(true);
      expect(service.hasPermission(Role.OWNER, [Permission.READ_AUDIT_LOG])).toBe(true);
    });

    it('should return true for admin with appropriate permissions', () => {
      expect(service.hasPermission(Role.ADMIN, [Permission.CREATE_TASK])).toBe(true);
      expect(service.hasPermission(Role.ADMIN, [Permission.UPDATE_TASK])).toBe(true);
      expect(service.hasPermission(Role.ADMIN, [Permission.READ_USER])).toBe(true);
    });

    it('should return false for admin with owner-only permissions', () => {
      expect(service.hasPermission(Role.ADMIN, [Permission.DELETE_USER])).toBe(false);
      expect(service.hasPermission(Role.ADMIN, [Permission.CREATE_ORGANIZATION])).toBe(false);
      expect(service.hasPermission(Role.ADMIN, [Permission.READ_AUDIT_LOG])).toBe(false);
    });

    it('should return true for viewer with read permissions', () => {
      expect(service.hasPermission(Role.VIEWER, [Permission.READ_TASK])).toBe(true);
      expect(service.hasPermission(Role.VIEWER, [Permission.READ_USER])).toBe(true);
      expect(service.hasPermission(Role.VIEWER, [Permission.CREATE_TASK])).toBe(true);
    });

    it('should return false for viewer with write permissions', () => {
      expect(service.hasPermission(Role.VIEWER, [Permission.UPDATE_TASK])).toBe(false);
      expect(service.hasPermission(Role.VIEWER, [Permission.DELETE_TASK])).toBe(false);
      expect(service.hasPermission(Role.VIEWER, [Permission.CREATE_USER])).toBe(false);
    });
  });

  describe('canAccessTask', () => {
    it('should allow owner to access any task', () => {
      expect(service.canAccessTask(Role.OWNER, 1, 2)).toBe(true);
      expect(service.canAccessTask(Role.OWNER, 1, 1)).toBe(true);
      expect(service.canAccessTask(Role.OWNER, null, null)).toBe(true);
    });

    it('should allow admin to access tasks in same organization', () => {
      expect(service.canAccessTask(Role.ADMIN, 1, 1)).toBe(true);
    });

    it('should deny admin access to tasks in different organization', () => {
      expect(service.canAccessTask(Role.ADMIN, 1, 2)).toBe(false);
    });

    it('should allow viewer to access tasks in same organization', () => {
      expect(service.canAccessTask(Role.VIEWER, 1, 1)).toBe(true);
    });

    it('should deny viewer access to tasks in different organization', () => {
      expect(service.canAccessTask(Role.VIEWER, 1, 2)).toBe(false);
    });
  });

  describe('getPermissionsForRole', () => {
    it('should return correct permissions for owner', () => {
      const permissions = service.getPermissionsForRole(Role.OWNER);
      expect(permissions).toContain(Permission.CREATE_TASK);
      expect(permissions).toContain(Permission.DELETE_USER);
      expect(permissions).toContain(Permission.READ_AUDIT_LOG);
      expect(permissions.length).toBeGreaterThan(10);
    });

    it('should return correct permissions for admin', () => {
      const permissions = service.getPermissionsForRole(Role.ADMIN);
      expect(permissions).toContain(Permission.CREATE_TASK);
      expect(permissions).toContain(Permission.UPDATE_TASK);
      expect(permissions).not.toContain(Permission.DELETE_USER);
      expect(permissions).not.toContain(Permission.READ_AUDIT_LOG);
    });

    it('should return correct permissions for viewer', () => {
      const permissions = service.getPermissionsForRole(Role.VIEWER);
      expect(permissions).toContain(Permission.READ_TASK);
      expect(permissions).toContain(Permission.CREATE_TASK);
      expect(permissions).not.toContain(Permission.UPDATE_TASK);
      expect(permissions).not.toContain(Permission.DELETE_TASK);
    });
  });
});


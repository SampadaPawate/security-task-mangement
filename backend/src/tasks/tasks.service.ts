import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '../entities/task.entity';
import { User } from '../entities/user.entity';
import { RbacService } from '../auth/rbac.service';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private rbacService: RbacService,
  ) {}

  async create(createTaskDto: any, userId: number) {
    const task = this.taskRepository.create({
      ...createTaskDto,
      createdById: userId,
    });

    return await this.taskRepository.save(task);
  }

  async findAll(userId: number, userRole: string, userOrgId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['organization']
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    let query = this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.assignedTo', 'assignedTo')
      .leftJoinAndSelect('task.createdBy', 'createdBy')
      .leftJoinAndSelect('createdBy.organization', 'createdByOrg')
      .leftJoinAndSelect('assignedTo.organization', 'assignedToOrg');

    // Apply RBAC filtering based on role and organization
    if (userRole === 'viewer') {
      // Viewers can only see tasks created by users in their organization
      if (userOrgId) {
        query = query.where('createdByOrg.id = :orgId', { orgId: userOrgId });
      } else {
        // If user has no organization, they can only see tasks created by users with no organization
        query = query.where('createdByOrg.id IS NULL');
      }
    } else if (userRole === 'admin') {
      // Admins can see tasks created by users in their organization
      if (userOrgId) {
        query = query.where('createdByOrg.id = :orgId', { orgId: userOrgId });
      } else {
        // If user has no organization, they can only see tasks created by users with no organization
        query = query.where('createdByOrg.id IS NULL');
      }
    }
    // Owners can see all tasks (no additional filtering)

    return query.getMany();
  }

  async findOne(id: number, userId: number, userRole: string, userOrgId: number) {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ['assignedTo', 'createdBy', 'createdBy.organization']
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Check if user has permission to access this task
    const canAccess = this.rbacService.canAccessTask(
      userRole,
      userOrgId,
      task.createdBy.organization?.id
    );

    if (!canAccess) {
      throw new ForbiddenException('Access denied to this task');
    }

    return task;
  }

  async update(id: number, updateTaskDto: any, userId: number, userRole: string) {
    const task = await this.findOne(id, userId, userRole, userId);

    // Check if user has permission to update this task
    if (userRole === 'viewer') {
      throw new ForbiddenException('Viewers cannot update tasks');
    }

    // Owners and Admins can update any task they have access to
    // (access is already checked in findOne method)
    
    Object.assign(task, updateTaskDto);
    return await this.taskRepository.save(task);
  }

  async remove(id: number, userId: number, userRole: string) {
    const task = await this.findOne(id, userId, userRole, userId);

    // Check if user has permission to delete this task
    if (userRole === 'viewer') {
      throw new ForbiddenException('Viewers cannot delete tasks');
    }

    // Owners and Admins can delete any task they have access to
    // (access is already checked in findOne method)
    
    console.log(`Deleting task ${id} by user ${userId} with role ${userRole}`);
    const result = await this.taskRepository.remove(task);
    console.log(`Task ${id} deleted successfully`);
    return result;
  }
}
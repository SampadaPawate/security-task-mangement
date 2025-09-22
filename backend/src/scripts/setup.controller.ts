import { Controller, Post } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, Role } from '../entities/user.entity';
import { Organization } from '../entities/organization.entity';
import { Task } from '../entities/task.entity';

@Controller('setup')
export class SetupController {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
  ) {}

  @Post('check-all-tasks')
  async checkAllTasks() {
    try {
      const allTasks = await this.taskRepository.find({
        relations: ['createdBy', 'createdBy.organization', 'assignedTo']
      });
      
      return {
        message: 'All tasks in database',
        count: allTasks.length,
        tasks: allTasks.map(task => ({
          id: task.id,
          title: task.title,
          createdBy: task.createdBy ? {
            id: task.createdBy.id,
            email: task.createdBy.email,
            role: task.createdBy.role,
            organizationId: task.createdBy.organizationId,
            organization: task.createdBy.organization?.name || 'No Organization'
          } : 'No Creator',
          status: task.status,
          priority: task.priority
        }))
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  @Post('fix-user-roles')
  async fixUserRoles() {
    try {
      const users = await this.userRepository.find();
      const updatedUsers = [];

      for (const user of users) {
        let newRole = user.role; // keep current role by default
        
        // Update based on email patterns
        if (user.email.toLowerCase().includes('owner')) {
          newRole = 'owner';
        } else if (user.email.toLowerCase().includes('admin')) {
          newRole = 'admin';
        } else if (user.role === 'user') {
          // Convert legacy "user" role to "admin" for full functionality
          newRole = 'admin';
        }

        // Only update if role is different
        if (user.role !== newRole) {
          await this.userRepository.update(user.id, { role: newRole });
          updatedUsers.push({
            id: user.id,
            email: user.email,
            oldRole: user.role,
            newRole: newRole
          });
        }
      }

      // Get all users to show current state
      const allUsers = await this.userRepository.find();

      return {
        message: 'User roles updated successfully!',
        updatedUsers,
        allUsers: allUsers.map(u => ({
          id: u.id,
          email: u.email,
          firstName: u.firstName,
          lastName: u.lastName,
          role: u.role
        }))
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  @Post('clear-and-setup')
  async clearAndSetupFresh() {
    try {
      // Clear all existing data
      console.log('🧹 Clearing existing data...');
      await this.taskRepository.query('DELETE FROM tasks');
      await this.userRepository.query('DELETE FROM users'); 
      await this.organizationRepository.query('DELETE FROM organizations');

      // Create fresh test users with exact specifications
      const testUsers = [
        {
          email: 'Admin@gmail.com',
          password: await this.hashPassword('Password123'),
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin'
        },
        {
          email: 'Owner@gmail.com', 
          password: await this.hashPassword('Password123'),
          firstName: 'Owner',
          lastName: 'User',
          role: 'owner'
        },
        {
          email: 'User@gmail.com',
          password: await this.hashPassword('Password123'),
          firstName: 'Regular',
          lastName: 'User',
          role: 'viewer'
        }
      ];

      console.log('👥 Creating fresh users...');
      const createdUsers = [];
      for (const userData of testUsers) {
        const user = this.userRepository.create(userData);
        const savedUser = await this.userRepository.save(user);
        createdUsers.push({
          id: savedUser.id,
          email: savedUser.email,
          firstName: savedUser.firstName,
          lastName: savedUser.lastName,
          role: savedUser.role
        });
      }

      return {
        message: '✅ Database cleared and fresh test accounts created!',
        users: createdUsers,
        credentials: {
          admin: 'Admin@gmail.com / Password123',
          owner: 'Owner@gmail.com / Password123', 
          user: 'User@gmail.com / Password123'
        },
        instructions: 'You can now test each account with their respective permissions!'
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  private async hashPassword(password: string): Promise<string> {
    const bcrypt = require('bcryptjs');
    return await bcrypt.hash(password, 10);
  }

  @Post('test-data')
  async setupTestData() {
    try {
      // Create test organization
      let testOrg = await this.organizationRepository.findOne({ where: { name: 'Test Organization' } });
      if (!testOrg) {
        testOrg = this.organizationRepository.create({
          name: 'Test Organization',
          description: 'Main test organization for RBAC testing'
        });
        await this.organizationRepository.save(testOrg);
      }

      // Create test users
      const testUsers = [
        {
          email: 'owner@test.com',
          password: 'password123',
          firstName: 'Owner',
          lastName: 'User',
          role: Role.OWNER,
          organizationId: testOrg.id
        },
        {
          email: 'admin@test.com',
          password: 'password123',
          firstName: 'Admin',
          lastName: 'User',
          role: Role.ADMIN,
          organizationId: testOrg.id
        },
        {
          email: 'viewer@test.com',
          password: 'password123',
          firstName: 'Viewer',
          lastName: 'User',
          role: Role.VIEWER,
          organizationId: testOrg.id
        }
      ];

      const createdUsers = [];
      for (const userData of testUsers) {
        let user = await this.userRepository.findOne({ where: { email: userData.email } });
        if (!user) {
          user = this.userRepository.create(userData);
          await this.userRepository.save(user);
          createdUsers.push(user);
        }
      }

      // Create some test tasks
      const owner = await this.userRepository.findOne({ where: { email: 'owner@test.com' } });
      const admin = await this.userRepository.findOne({ where: { email: 'admin@test.com' } });

      const testTasks = [
        {
          title: 'Owner Task 1',
          description: 'This task was created by the owner',
          priority: 3,
          status: 'todo',
          createdById: owner.id
        },
        {
          title: 'Admin Task 1',
          description: 'This task was created by the admin',
          priority: 2,
          status: 'in_progress',
          createdById: admin.id
        }
      ];

      const createdTasks = [];
      for (const taskData of testTasks) {
        let task = await this.taskRepository.findOne({ where: { title: taskData.title } });
        if (!task) {
          task = this.taskRepository.create(taskData);
          await this.taskRepository.save(task);
          createdTasks.push(task);
        }
      }

      return {
        message: 'Test data setup complete!',
        organization: testOrg,
        users: createdUsers,
        tasks: createdTasks,
        credentials: {
          owner: 'owner@test.com / password123',
          admin: 'admin@test.com / password123',
          viewer: 'viewer@test.com / password123'
        }
      };
    } catch (error) {
      return { error: error.message };
    }
  }
}

import { DataSource } from 'typeorm';
import { User, Role } from '../entities/user.entity';
import { Organization } from '../entities/organization.entity';
import { Task } from '../entities/task.entity';

const AppDataSource = new DataSource({
  type: 'sqlite',
  database: 'database.sqlite',
  entities: [User, Organization, Task],
  synchronize: true,
});

async function setupTestData() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected');

    const userRepo = AppDataSource.getRepository(User);
    const orgRepo = AppDataSource.getRepository(Organization);
    const taskRepo = AppDataSource.getRepository(Task);

    // Create test organization
    let testOrg = await orgRepo.findOne({ where: { name: 'Test Organization' } });
    if (!testOrg) {
      testOrg = orgRepo.create({
        name: 'Test Organization',
        description: 'Main test organization for RBAC testing'
      });
      await orgRepo.save(testOrg);
      console.log('Created test organization');
    }

    // Create test users (using plain passwords for testing - in production, use bcrypt)
    const testUsers = [
      {
        email: 'owner@test.com',
        password: 'password123', // In production, this should be hashed
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

    for (const userData of testUsers) {
      let user = await userRepo.findOne({ where: { email: userData.email } });
      if (!user) {
        user = userRepo.create(userData);
        await userRepo.save(user);
        console.log(`Created ${userData.role} user: ${userData.email}`);
      }
    }

    // Create some test tasks
    const owner = await userRepo.findOne({ where: { email: 'owner@test.com' } });
    const admin = await userRepo.findOne({ where: { email: 'admin@test.com' } });

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
      },
      {
        title: 'Owner Task 2',
        description: 'Another task created by the owner',
        priority: 4,
        status: 'completed',
        createdById: owner.id
      }
    ];

    for (const taskData of testTasks) {
      let task = await taskRepo.findOne({ where: { title: taskData.title } });
      if (!task) {
        task = taskRepo.create(taskData);
        await taskRepo.save(task);
        console.log(`Created test task: ${taskData.title}`);
      }
    }

    console.log('Test data setup complete!');
    console.log('Test credentials:');
    console.log('- Owner: owner@test.com / password123');
    console.log('- Admin: admin@test.com / password123');
    console.log('- Viewer: viewer@test.com / password123');

  } catch (error) {
    console.error('Error setting up test data:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

setupTestData();

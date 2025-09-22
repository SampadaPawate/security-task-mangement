import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';

async function upgradeUserRole() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const userRepository = app.get(getRepositoryToken(User));

  try {
    // Find user by email
    const user = await userRepository.findOne({ where: { email: 'sampadapawate@gmail.com' } });
    
    if (!user) {
      console.log('User not found');
      return;
    }

    // Upgrade to admin role
    user.role = 'admin';
    await userRepository.save(user);
    
    console.log(`✅ User ${user.email} upgraded to ADMIN role`);
    console.log('✅ New permissions: CREATE_TASK, READ_TASK, UPDATE_TASK, DELETE_TASK');
    console.log('✅ You can now create, update, and delete tasks!');
    
  } catch (error) {
    console.error('Error upgrading user:', error);
  } finally {
    await app.close();
  }
}

upgradeUserRole();

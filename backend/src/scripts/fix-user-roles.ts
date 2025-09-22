import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';

async function fixUserRoles() {
  console.log('🔧 Fixing user roles...');
  
  const app = await NestFactory.createApplicationContext(AppModule);
  const userRepository = app.get<Repository<User>>(getRepositoryToken(User));

  try {
    // Get all users
    const users = await userRepository.find();
    console.log(`Found ${users.length} users`);

    // Update users based on email patterns or specific logic
    for (const user of users) {
      let newRole = 'viewer'; // default
      
      // Assign roles based on email patterns or specific emails
      if (user.email.toLowerCase().includes('owner') || user.email.toLowerCase().includes('admin@')) {
        newRole = 'owner';
      } else if (user.email.toLowerCase().includes('admin')) {
        newRole = 'admin';
      }

      if (user.role !== newRole) {
        console.log(`Updating ${user.email} from ${user.role} to ${newRole}`);
        await userRepository.update(user.id, { role: newRole });
      }
    }

    console.log('✅ User roles updated successfully!');
  } catch (error) {
    console.error('❌ Error updating user roles:', error);
  } finally {
    await app.close();
  }
}

if (require.main === module) {
  fixUserRoles();
}

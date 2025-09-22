import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { User, Task, Organization, AuditLog } from './entities';
import { AuthModule } from './auth/auth.module';
import { TasksModule } from './tasks/tasks.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { AuditModule } from './audit/audit.module';
import { SetupController } from './scripts/setup.controller';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'database.sqlite',
      entities: [User, Task, Organization, AuditLog],
      synchronize: true, // Only for development
      logging: true,
    }),
    TypeOrmModule.forFeature([User, Organization, Task]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '24h' },
    }),
    AuthModule,
    TasksModule,
    OrganizationsModule,
    AuditModule,
  ],
  controllers: [SetupController],
})
export class AppModule {}

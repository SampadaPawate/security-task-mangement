import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from './user.entity';

export enum AuditAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  LOGIN = 'login',
  LOGOUT = 'logout',
  PERMISSION_DENIED = 'permission_denied'
}

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  action: string;

  @Column()
  resource: string; // e.g., 'task', 'user', 'organization'

  @Column({ nullable: true })
  resourceId: number;

  @Column({ type: 'text', nullable: true })
  oldValues: string;

  @Column({ type: 'text', nullable: true })
  newValues: string;

  @Column({ nullable: true })
  userId: number;

  @ManyToOne(() => User, { nullable: true })
  user: User;

  @Column({ nullable: true, length: 500 })
  ipAddress: string;

  @Column({ nullable: true, length: 1000 })
  userAgent: string;

  @Column({ nullable: true, length: 500 })
  details: string;

  @CreateDateColumn()
  createdAt: Date;
}


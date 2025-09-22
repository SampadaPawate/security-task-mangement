import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed'
}

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', default: 'todo' })
  status: string;

  @Column({ type: 'int', default: 1 })
  priority: number; // 1-5 scale

  @Column({ nullable: true })
  dueDate: Date;

  @Column({ nullable: true })
  assignedToId: number;

  @ManyToOne(() => User, user => user.assignedTasks)
  assignedTo: User;

  @Column()
  createdById: number;

  @ManyToOne(() => User, user => user.createdTasks)
  createdBy: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

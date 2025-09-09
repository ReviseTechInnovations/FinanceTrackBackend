import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity';
import { Project } from './project.entity';

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  IN_REVIEW = 'in_review',
  COMPLETED = 'completed'
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

@Entity('tasks')
export class Task {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'Homepage Layout' })
  @Column({ length: 200 })
  title: string;

  @ApiProperty({ example: 'Create responsive homepage layout...' })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({ enum: TaskStatus, example: TaskStatus.TODO })
  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.TODO
  })
  status: TaskStatus;

  @ApiProperty({ enum: TaskPriority, example: TaskPriority.MEDIUM })
  @Column({
    type: 'enum',
    enum: TaskPriority,
    default: TaskPriority.MEDIUM
  })
  priority: TaskPriority;

  @ApiProperty({ example: 'AC-001' })
  @Column({ length: 50 })
  taskCode: string;

  @ApiProperty({ example: '2023-08-25T00:00:00.000Z' })
  @Column({ type: 'date', nullable: true })
  dueDate: Date;

  @ApiProperty({ example: 5 })
  @Column({ type: 'int', nullable: true })
  estimatedHours: number;

  @ApiProperty({ example: 3 })
  @Column({ type: 'int', default: 0 })
  actualHours: number;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ApiProperty({ example: 1 })
  @Column()
  @Index()
  userId: number;

  @ManyToOne(() => User, (user) => user.projects)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ApiProperty({ example: 1 })
  @Column()
  @Index()
  projectId: number;

  @ManyToOne(() => Project, (project) => project.tasks)
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @ApiProperty({ example: 1 })
  @Column({ nullable: true })
  assignedToId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'assignedToId' })
  assignedTo: User;

  // Virtual properties
  get isOverdue(): boolean {
    if (!this.dueDate) return false;
    return new Date() > this.dueDate && this.status !== TaskStatus.COMPLETED;
  }

  get daysRemaining(): number {
    if (!this.dueDate) return 0;
    const now = new Date();
    const diffTime = this.dueDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  get progressPercentage(): number {
    if (!this.estimatedHours) return 0;
    return Math.min((this.actualHours / this.estimatedHours) * 100, 100);
  }
}

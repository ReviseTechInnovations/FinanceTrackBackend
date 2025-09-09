import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity';
import { Task } from './task.entity';

export enum ProjectStatus {
  PLANNING = 'planning',
  IN_PROGRESS = 'in_progress',
  ON_HOLD = 'on_hold',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum ProjectPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

@Entity('projects')
export class Project {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'Apollo Authentication flow revamp' })
  @Column({ length: 200 })
  name: string;

  @ApiProperty({ example: 'AC-001' })
  @Column({ length: 50, unique: true })
  @Index()
  projectCode: string;

  @ApiProperty({ example: 'Redesign login, signup, and reset flows...' })
  @Column({ type: 'text' })
  description: string;

  @ApiProperty({ enum: ProjectStatus, example: ProjectStatus.IN_PROGRESS })
  @Column({
    type: 'enum',
    enum: ProjectStatus,
    default: ProjectStatus.PLANNING
  })
  status: ProjectStatus;

  @ApiProperty({ enum: ProjectPriority, example: ProjectPriority.HIGH })
  @Column({
    type: 'enum',
    enum: ProjectPriority,
    default: ProjectPriority.MEDIUM
  })
  priority: ProjectPriority;

  @ApiProperty({ example: 'Apollo LTD' })
  @Column({ length: 100 })
  client: string;

  @ApiProperty({ example: '2023-08-28T00:00:00.000Z' })
  @Column({ type: 'date', nullable: true })
  startDate: Date;

  @ApiProperty({ example: '2023-08-28T00:00:00.000Z' })
  @Column({ type: 'date', nullable: true })
  dueDate: Date;

  @ApiProperty({ example: 10000.0 })
  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  budget: number;

  @ApiProperty({ example: 75 })
  @Column({ type: 'int', default: 0 })
  progress: number;

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

  @OneToMany(() => Task, (task) => task.project)
  tasks: Task[];

  // Virtual properties
  get isOverdue(): boolean {
    if (!this.dueDate) return false;
    return new Date() > this.dueDate && this.status !== ProjectStatus.COMPLETED;
  }

  get daysRemaining(): number {
    if (!this.dueDate) return 0;
    const now = new Date();
    const diffTime = this.dueDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}

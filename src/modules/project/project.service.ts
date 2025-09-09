import {
  Injectable,
  NotFoundException,
  BadRequestException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project, ProjectStatus } from '../../database/entities/project.entity';
import { Task, TaskStatus } from '../../database/entities/task.entity';
import { User } from '../../database/entities/user.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  async createProject(
    userId: number,
    createProjectDto: CreateProjectDto
  ): Promise<Project> {
    // Check if project code already exists
    const existingProject = await this.projectRepository.findOne({
      where: { projectCode: createProjectDto.projectCode }
    });

    if (existingProject) {
      throw new BadRequestException('Project code already exists');
    }

    const project = this.projectRepository.create({
      ...createProjectDto,
      userId
    });

    return this.projectRepository.save(project);
  }

  async getAllProjects(
    userId: number,
    page: number = 1,
    limit: number = 10,
    search?: string
  ): Promise<{
    projects: Project[];
    total: number;
    page: number;
    limit: number;
  }> {
    const queryBuilder = this.projectRepository
      .createQueryBuilder('project')
      .where('project.userId = :userId', { userId })
      .leftJoinAndSelect('project.tasks', 'tasks')
      .leftJoinAndSelect('tasks.assignedTo', 'assignedTo');

    if (search) {
      queryBuilder.andWhere(
        '(project.name ILIKE :search OR project.client ILIKE :search OR project.projectCode ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    const [projects, total] = await queryBuilder
      .orderBy('project.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      projects,
      total,
      page,
      limit
    };
  }

  async getProjectById(userId: number, projectId: number): Promise<Project> {
    const project = await this.projectRepository.findOne({
      where: { id: projectId, userId },
      relations: ['tasks', 'tasks.assignedTo']
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }

  async updateProject(
    userId: number,
    projectId: number,
    updateProjectDto: UpdateProjectDto
  ): Promise<Project> {
    const project = await this.getProjectById(userId, projectId);

    // Check if project code is being updated and if it already exists
    if (
      updateProjectDto.projectCode &&
      updateProjectDto.projectCode !== project.projectCode
    ) {
      const existingProject = await this.projectRepository.findOne({
        where: { projectCode: updateProjectDto.projectCode }
      });

      if (existingProject) {
        throw new BadRequestException('Project code already exists');
      }
    }

    Object.assign(project, updateProjectDto);
    return this.projectRepository.save(project);
  }

  async deleteProject(
    userId: number,
    projectId: number
  ): Promise<{ message: string }> {
    const project = await this.getProjectById(userId, projectId);

    // Delete all tasks first
    await this.taskRepository.delete({ projectId });

    // Delete project
    await this.projectRepository.remove(project);

    return { message: 'Project deleted successfully' };
  }

  async getKanbanBoard(userId: number, projectId?: number): Promise<any> {
    const queryBuilder = this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.project', 'project')
      .leftJoinAndSelect('task.assignedTo', 'assignedTo')
      .where('project.userId = :userId', { userId });

    if (projectId) {
      queryBuilder.andWhere('task.projectId = :projectId', { projectId });
    }

    const tasks = await queryBuilder.getMany();

    // Group tasks by status
    const kanbanBoard = {
      todo: tasks.filter((task) => task.status === TaskStatus.TODO),
      inProgress: tasks.filter(
        (task) => task.status === TaskStatus.IN_PROGRESS
      ),
      inReview: tasks.filter((task) => task.status === TaskStatus.IN_REVIEW),
      completed: tasks.filter((task) => task.status === TaskStatus.COMPLETED)
    };

    return {
      columns: [
        {
          id: 'todo',
          title: 'To-do',
          tasks: kanbanBoard.todo,
          count: kanbanBoard.todo.length
        },
        {
          id: 'inProgress',
          title: 'In Progress',
          tasks: kanbanBoard.inProgress,
          count: kanbanBoard.inProgress.length
        },
        {
          id: 'inReview',
          title: 'In Review',
          tasks: kanbanBoard.inReview,
          count: kanbanBoard.inReview.length
        },
        {
          id: 'completed',
          title: 'Completed',
          tasks: kanbanBoard.completed,
          count: kanbanBoard.completed.length
        }
      ]
    };
  }

  async createTask(
    userId: number,
    createTaskDto: CreateTaskDto
  ): Promise<Task> {
    // Verify project belongs to user
    const project = await this.projectRepository.findOne({
      where: { id: createTaskDto.projectId, userId }
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Check if task code already exists in the project
    const existingTask = await this.taskRepository.findOne({
      where: {
        taskCode: createTaskDto.taskCode,
        projectId: createTaskDto.projectId
      }
    });

    if (existingTask) {
      throw new BadRequestException('Task code already exists in this project');
    }

    // Verify assigned user exists if provided
    if (createTaskDto.assignedToId) {
      const assignedUser = await this.userRepository.findOne({
        where: { id: createTaskDto.assignedToId }
      });

      if (!assignedUser) {
        throw new NotFoundException('Assigned user not found');
      }
    }

    const task = this.taskRepository.create({
      ...createTaskDto,
      userId
    });

    return this.taskRepository.save(task);
  }

  async getTaskById(userId: number, taskId: number): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id: taskId, userId },
      relations: ['project', 'assignedTo']
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  async updateTask(
    userId: number,
    taskId: number,
    updateTaskDto: UpdateTaskDto
  ): Promise<Task> {
    const task = await this.getTaskById(userId, taskId);

    // Check if task code is being updated and if it already exists
    if (updateTaskDto.taskCode && updateTaskDto.taskCode !== task.taskCode) {
      const existingTask = await this.taskRepository.findOne({
        where: { taskCode: updateTaskDto.taskCode, projectId: task.projectId }
      });

      if (existingTask) {
        throw new BadRequestException(
          'Task code already exists in this project'
        );
      }
    }

    // Verify assigned user exists if provided
    if (updateTaskDto.assignedToId) {
      const assignedUser = await this.userRepository.findOne({
        where: { id: updateTaskDto.assignedToId }
      });

      if (!assignedUser) {
        throw new NotFoundException('Assigned user not found');
      }
    }

    Object.assign(task, updateTaskDto);
    return this.taskRepository.save(task);
  }

  async deleteTask(
    userId: number,
    taskId: number
  ): Promise<{ message: string }> {
    const task = await this.getTaskById(userId, taskId);
    await this.taskRepository.remove(task);

    return { message: 'Task deleted successfully' };
  }

  async moveTask(
    userId: number,
    taskId: number,
    newStatus: TaskStatus
  ): Promise<Task> {
    const task = await this.getTaskById(userId, taskId);
    task.status = newStatus;
    return this.taskRepository.save(task);
  }

  async getProjectStats(userId: number, projectId: number): Promise<any> {
    const project = await this.getProjectById(userId, projectId);
    const tasks = project.tasks;

    const stats = {
      total: tasks.length,
      todo: tasks.filter((t) => t.status === TaskStatus.TODO).length,
      inProgress: tasks.filter((t) => t.status === TaskStatus.IN_PROGRESS)
        .length,
      inReview: tasks.filter((t) => t.status === TaskStatus.IN_REVIEW).length,
      completed: tasks.filter((t) => t.status === TaskStatus.COMPLETED).length,
      overdue: tasks.filter((t) => t.isOverdue).length,
      totalEstimatedHours: tasks.reduce(
        (sum, t) => sum + (t.estimatedHours || 0),
        0
      ),
      totalActualHours: tasks.reduce((sum, t) => sum + t.actualHours, 0)
    };

    return {
      ...stats,
      completionRate:
        stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0
    };
  }
}

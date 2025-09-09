import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery
} from '@nestjs/swagger';
import { ProjectService } from './project.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Project } from '../../database/entities/project.entity';
import { Task, TaskStatus } from '../../database/entities/task.entity';
import { User } from '../../database/entities/user.entity';

@ApiTags('Projects')
@Controller('projects')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProjectController {
  constructor(private projectService: ProjectService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new project' })
  @ApiResponse({
    status: 201,
    description: 'Project created successfully',
    type: Project
  })
  async createProject(
    @CurrentUser() user: User,
    @Body() createProjectDto: CreateProjectDto
  ): Promise<Project> {
    return this.projectService.createProject(user.id, createProjectDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all projects' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    example: 'apollo'
  })
  @ApiResponse({
    status: 200,
    description: 'Projects retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        projects: {
          type: 'array',
          items: { $ref: '#/components/schemas/Project' }
        },
        total: { type: 'number', example: 25 },
        page: { type: 'number', example: 1 },
        limit: { type: 'number', example: 10 }
      }
    }
  })
  async getAllProjects(
    @CurrentUser() user: User,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
    @Query('search') search?: string
  ): Promise<{
    projects: Project[];
    total: number;
    page: number;
    limit: number;
  }> {
    return this.projectService.getAllProjects(user.id, page, limit, search);
  }

  @Get('kanban')
  @ApiOperation({ summary: 'Get Kanban board' })
  @ApiQuery({ name: 'projectId', required: false, type: Number, example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Kanban board retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        columns: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'todo' },
              title: { type: 'string', example: 'To-do' },
              tasks: {
                type: 'array',
                items: { $ref: '#/components/schemas/Task' }
              },
              count: { type: 'number', example: 3 }
            }
          }
        }
      }
    }
  })
  async getKanbanBoard(
    @CurrentUser() user: User,
    @Query('projectId', new ParseIntPipe({ optional: true }))
    projectId?: number
  ): Promise<any> {
    return this.projectService.getKanbanBoard(user.id, projectId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get project by ID' })
  @ApiResponse({
    status: 200,
    description: 'Project retrieved successfully',
    type: Project
  })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async getProjectById(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) projectId: number
  ): Promise<Project> {
    return this.projectService.getProjectById(user.id, projectId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update project' })
  @ApiResponse({
    status: 200,
    description: 'Project updated successfully',
    type: Project
  })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async updateProject(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) projectId: number,
    @Body() updateProjectDto: UpdateProjectDto
  ): Promise<Project> {
    return this.projectService.updateProject(
      user.id,
      projectId,
      updateProjectDto
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete project' })
  @ApiResponse({
    status: 200,
    description: 'Project deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Project deleted successfully' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async deleteProject(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) projectId: number
  ): Promise<{ message: string }> {
    return this.projectService.deleteProject(user.id, projectId);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get project statistics' })
  @ApiResponse({
    status: 200,
    description: 'Project statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number', example: 10 },
        todo: { type: 'number', example: 3 },
        inProgress: { type: 'number', example: 2 },
        inReview: { type: 'number', example: 1 },
        completed: { type: 'number', example: 4 },
        overdue: { type: 'number', example: 1 },
        totalEstimatedHours: { type: 'number', example: 80 },
        totalActualHours: { type: 'number', example: 65 },
        completionRate: { type: 'number', example: 40 }
      }
    }
  })
  async getProjectStats(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) projectId: number
  ): Promise<any> {
    return this.projectService.getProjectStats(user.id, projectId);
  }

  // Task endpoints
  @Post('tasks')
  @ApiOperation({ summary: 'Create a new task' })
  @ApiResponse({
    status: 201,
    description: 'Task created successfully',
    type: Task
  })
  async createTask(
    @CurrentUser() user: User,
    @Body() createTaskDto: CreateTaskDto
  ): Promise<Task> {
    return this.projectService.createTask(user.id, createTaskDto);
  }

  @Get('tasks/:taskId')
  @ApiOperation({ summary: 'Get task by ID' })
  @ApiResponse({
    status: 200,
    description: 'Task retrieved successfully',
    type: Task
  })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async getTaskById(
    @CurrentUser() user: User,
    @Param('taskId', ParseIntPipe) taskId: number
  ): Promise<Task> {
    return this.projectService.getTaskById(user.id, taskId);
  }

  @Put('tasks/:taskId')
  @ApiOperation({ summary: 'Update task' })
  @ApiResponse({
    status: 200,
    description: 'Task updated successfully',
    type: Task
  })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async updateTask(
    @CurrentUser() user: User,
    @Param('taskId', ParseIntPipe) taskId: number,
    @Body() updateTaskDto: UpdateTaskDto
  ): Promise<Task> {
    return this.projectService.updateTask(user.id, taskId, updateTaskDto);
  }

  @Put('tasks/:taskId/move')
  @ApiOperation({ summary: 'Move task to different status' })
  @ApiResponse({
    status: 200,
    description: 'Task moved successfully',
    type: Task
  })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async moveTask(
    @CurrentUser() user: User,
    @Param('taskId', ParseIntPipe) taskId: number,
    @Body('status') newStatus: TaskStatus
  ): Promise<Task> {
    return this.projectService.moveTask(user.id, taskId, newStatus);
  }

  @Delete('tasks/:taskId')
  @ApiOperation({ summary: 'Delete task' })
  @ApiResponse({
    status: 200,
    description: 'Task deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Task deleted successfully' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async deleteTask(
    @CurrentUser() user: User,
    @Param('taskId', ParseIntPipe) taskId: number
  ): Promise<{ message: string }> {
    return this.projectService.deleteTask(user.id, taskId);
  }
}

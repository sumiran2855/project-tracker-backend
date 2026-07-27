import { Request, Response, NextFunction } from 'express';
import { TaskService } from '../services/TaskService.js';
import { ProjectService } from '../services/ProjectService.js';
import { CustomError } from '../helpers/CustomError.js';

export class TaskController {
  private taskService: TaskService;
  private projectService: ProjectService;

  constructor() {
    this.taskService = new TaskService();
    this.projectService = new ProjectService();
  }

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { title, description, status, priority, projectId, startDate, dueDate, assignees, subtasks, comments, actualHours } = req.body;
      const task = await this.taskService.createTask(
        title,
        description,
        status,
        priority,
        projectId,
        startDate,
        dueDate,
        assignees,
        subtasks,
        comments,
        actualHours
      );

      res.status(201).json({
        success: true,
        data: { task },
      });
    } catch (error) {
      next(error);
    }
  };

  getByProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { projectId } = req.params;
      const user = (req as any).user;
      await this.projectService.getProjectById(projectId, user.userId, user.role);

      const tasks = await this.taskService.getTasksByProject(projectId);
      
      let filteredTasks = tasks;
      if (user.role?.toLowerCase() === 'employee') {
        filteredTasks = tasks.filter(t => t.assignees && t.assignees.some((a: any) => a.userId?.toString() === user.userId.toString()));
      }

      res.status(200).json({
        success: true,
        data: { tasks: filteredTasks },
      });
    } catch (error) {
      next(error);
    }
  };

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = (req as any).user;
      const projects = await this.projectService.getProjectsForUser(user.userId, user.role);
      const projectIds = projects.map(p => p._id.toString());

      const allTasks = await this.taskService.getAllTasks();
      let tasks = allTasks.filter(t => t.projectId && projectIds.includes(t.projectId.toString()));

      if (user.role?.toLowerCase() === 'employee') {
        tasks = tasks.filter(t => t.assignees && t.assignees.some((a: any) => a.userId?.toString() === user.userId.toString()));
      }

      res.status(200).json({
        success: true,
        data: { tasks },
      });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const user = (req as any).user;
      const task = await this.taskService.getTaskById(id);

      await this.projectService.getProjectById(task.projectId.toString(), user.userId, user.role);

      if (user.role?.toLowerCase() === 'employee') {
        const isAssigned = task.assignees && task.assignees.some((a: any) => a.userId?.toString() === user.userId.toString());
        if (!isAssigned) {
          throw new CustomError(403, 'Access denied: You are not assigned to this task');
        }
      }

      res.status(200).json({
        success: true,
        data: { task },
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const currentUser = (req as any).user;
      const task = await this.taskService.getTaskById(id);

      await this.projectService.getProjectById(task.projectId.toString(), currentUser.userId, currentUser.role);

      if (currentUser.role?.toLowerCase() === 'employee') {
        const isAssigned = task.assignees && task.assignees.some((a: any) => a.userId?.toString() === currentUser.userId.toString());
        if (!isAssigned) {
          throw new CustomError(403, 'Access denied: You are not assigned to this task');
        }
      }

      const updateData = {
        ...req.body,
        updatedByUserId: currentUser?.userId,
        updatedByUserName: currentUser?.name || currentUser?.email,
      };
      const updatedTask = await this.taskService.updateTask(id, updateData);

      res.status(200).json({
        success: true,
        data: { task: updatedTask },
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const user = (req as any).user;
      const task = await this.taskService.getTaskById(id);

      await this.projectService.getProjectById(task.projectId.toString(), user.userId, user.role);

      if (user.role?.toLowerCase() === 'employee') {
        const isAssigned = task.assignees && task.assignees.some((a: any) => a.userId?.toString() === user.userId.toString());
        if (!isAssigned) {
          throw new CustomError(403, 'Access denied: You are not assigned to this task');
        }
      }

      await this.taskService.deleteTask(id);

      res.status(200).json({
        success: true,
        message: 'Task deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}

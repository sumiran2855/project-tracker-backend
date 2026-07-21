import { Request, Response, NextFunction } from 'express';
import { TaskService } from '../services/TaskService.js';

export class TaskController {
  private taskService: TaskService;

  constructor() {
    this.taskService = new TaskService();
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
      const tasks = await this.taskService.getTasksByProject(projectId);

      res.status(200).json({
        success: true,
        data: { tasks },
      });
    } catch (error) {
      next(error);
    }
  };

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tasks = await this.taskService.getAllTasks();

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
      const task = await this.taskService.getTaskById(id);

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
      const updateData = {
        ...req.body,
        updatedByUserId: currentUser?.userId,
        updatedByUserName: currentUser?.name || currentUser?.email,
      };
      const task = await this.taskService.updateTask(id, updateData);

      res.status(200).json({
        success: true,
        data: { task },
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
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

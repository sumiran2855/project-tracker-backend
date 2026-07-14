import { Request, Response, NextFunction } from 'express';
import { ProjectService } from '../services/ProjectService.js';

export class ProjectController {
  private projectService: ProjectService;

  constructor() {
    this.projectService = new ProjectService();
  }

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, description, tags, dueDate } = req.body;
      const user = (req as any).user;
      
      const project = await this.projectService.createProject(name, description, tags, dueDate, {
        id: user.userId,
        name: user.name,
      });

      res.status(201).json({
        success: true,
        data: { project },
      });
    } catch (error) {
      next(error);
    }
  };

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user.userId;
      const projects = await this.projectService.getProjectsForUser(userId);
      
      res.status(200).json({
        success: true,
        data: { projects },
      });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = (req as any).user.userId;
      const project = await this.projectService.getProjectById(id, userId);

      res.status(200).json({
        success: true,
        data: { project },
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = (req as any).user.userId;
      const project = await this.projectService.updateProject(id, userId, req.body);

      res.status(200).json({
        success: true,
        data: { project },
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = (req as any).user.userId;
      await this.projectService.deleteProject(id, userId);

      res.status(200).json({
        success: true,
        message: 'Project deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  addMember = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = (req as any).user.userId;
      const { memberUserId, memberName } = req.body;

      const project = await this.projectService.addMember(id, userId, {
        id: memberUserId,
        name: memberName,
      });

      res.status(200).json({
        success: true,
        data: { project },
      });
    } catch (error) {
      next(error);
    }
  };
}

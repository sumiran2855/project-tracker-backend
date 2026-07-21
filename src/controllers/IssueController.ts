import { Request, Response, NextFunction } from 'express';
import { IssueService } from '../services/IssueService.js';

export class IssueController {
  private issueService: IssueService;

  constructor() {
    this.issueService = new IssueService();
  }

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { title, description, status, priority, type, projectId, dueDate, assignees } = req.body;
      const issue = await this.issueService.createIssue(
        title,
        description,
        status,
        priority,
        type,
        projectId,
        dueDate,
        assignees
      );

      res.status(201).json({
        success: true,
        data: { issue },
      });
    } catch (error) {
      next(error);
    }
  };

  getByProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { projectId } = req.params;
      const issues = await this.issueService.getIssuesByProject(projectId);

      res.status(200).json({
        success: true,
        data: { issues },
      });
    } catch (error) {
      next(error);
    }
  };

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const issues = await this.issueService.getAllIssues();

      res.status(200).json({
        success: true,
        data: { issues },
      });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const issue = await this.issueService.getIssueById(id);

      res.status(200).json({
        success: true,
        data: { issue },
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
      const issue = await this.issueService.updateIssue(id, updateData);

      res.status(200).json({
        success: true,
        data: { issue },
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.issueService.deleteIssue(id);

      res.status(200).json({
        success: true,
        message: 'Issue deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}

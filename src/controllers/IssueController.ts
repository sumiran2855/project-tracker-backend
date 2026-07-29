import { Request, Response, NextFunction } from 'express';
import { IssueService } from '../services/IssueService.js';
import { ProjectService } from '../services/ProjectService.js';
import { v2 as cloudinary } from 'cloudinary';
import { env } from '../config/env.js';
import fs from 'fs';

export class IssueController {
  constructor(
    private readonly issueService: IssueService,
    private readonly projectService: ProjectService
  ) {}

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { title, description, status, priority, type, projectId, dueDate, assignees, relatedTaskId, relatedTaskTitle, attachments } = req.body;
      const issue = await this.issueService.createIssue(
        title,
        description,
        status,
        priority,
        type,
        projectId,
        dueDate,
        assignees,
        relatedTaskId,
        relatedTaskTitle,
        attachments
      );

      res.status(201).json({
        success: true,
        data: { issue },
      });
    } catch (error) {
      next(error);
    }
  };

  uploadAttachment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ success: false, message: 'No file uploaded' });
        return;
      }

      // Check if Cloudinary is configured
      if (env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET) {
        cloudinary.config({
          cloud_name: env.CLOUDINARY_CLOUD_NAME,
          api_key: env.CLOUDINARY_API_KEY,
          api_secret: env.CLOUDINARY_API_SECRET
        });

        try {
          const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'issues_attachments'
          });

          // Clean up local temp file asynchronously
          fs.promises.unlink(req.file.path).catch(err => {
            console.error('Failed to delete temp file:', err);
          });

          res.status(200).json({
            success: true,
            data: { url: result.secure_url }
          });
          return;
        } catch (uploadError) {
          console.error('Cloudinary upload failed, falling back to local storage:', uploadError);
          // If Cloudinary upload fails, fall back to local disk storage below
        }
      }

      // Fallback: Local disk storage
      const fileUrl = `/uploads/${req.file.filename}`;
      res.status(200).json({
        success: true,
        data: { url: fileUrl }
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
      const user = (req as any).user;
      const projects = await this.projectService.getProjectsForUser(user.userId, user.role);
      const projectIds = projects.map(p => p._id.toString());

      const allIssues = await this.issueService.getAllIssues();
      const issues = allIssues.filter(i => i.projectId && projectIds.includes(i.projectId.toString()));

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
      const user = (req as any).user;
      const issue = await this.issueService.getIssueById(id);

      await this.projectService.getProjectById(issue.projectId.toString(), user.userId, user.role);

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
      const issue = await this.issueService.getIssueById(id);

      await this.projectService.getProjectById(issue.projectId.toString(), currentUser.userId, currentUser.role);

      const updateData = {
        ...req.body,
        updatedByUserId: currentUser?.userId,
        updatedByUserName: currentUser?.name || currentUser?.email,
      };
      const updatedIssue = await this.issueService.updateIssue(id, updateData);

      res.status(200).json({
        success: true,
        data: { issue: updatedIssue },
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const user = (req as any).user;
      const issue = await this.issueService.getIssueById(id);

      await this.projectService.getProjectById(issue.projectId.toString(), user.userId, user.role);

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

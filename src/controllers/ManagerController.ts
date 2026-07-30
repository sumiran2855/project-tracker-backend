import { Request, Response, NextFunction } from 'express';
import { ManagerService } from '../services/ManagerService.js';

export class ManagerController {
  constructor(private readonly managerService: ManagerService) {}

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const managers = await this.managerService.getManagers();
      res.status(200).json({
        success: true,
        data: { managers },
      });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const manager = await this.managerService.getManagerDetails(id);
      res.status(200).json({
        success: true,
        data: { manager },
      });
    } catch (error) {
      next(error);
    }
  };

  updateAssignments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { employeeIds, teamLeadIds } = req.body;
      await this.managerService.updateAssignments(id, employeeIds || [], teamLeadIds || []);
      res.status(200).json({
        success: true,
        message: 'Assignments updated successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  getMyTeam = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = (req as any).user;
      const team = await this.managerService.getManagerTeam(user.userId);
      res.status(200).json({
        success: true,
        data: { team },
      });
    } catch (error) {
      next(error);
    }
  };
}

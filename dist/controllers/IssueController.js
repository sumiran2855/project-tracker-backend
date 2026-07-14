import { IssueService } from '../services/IssueService.js';
export class IssueController {
    issueService;
    constructor() {
        this.issueService = new IssueService();
    }
    create = async (req, res, next) => {
        try {
            const { title, description, status, priority, type, projectId, dueDate, assignees } = req.body;
            const issue = await this.issueService.createIssue(title, description, status, priority, type, projectId, dueDate, assignees);
            res.status(201).json({
                success: true,
                data: { issue },
            });
        }
        catch (error) {
            next(error);
        }
    };
    getByProject = async (req, res, next) => {
        try {
            const { projectId } = req.params;
            const issues = await this.issueService.getIssuesByProject(projectId);
            res.status(200).json({
                success: true,
                data: { issues },
            });
        }
        catch (error) {
            next(error);
        }
    };
    getById = async (req, res, next) => {
        try {
            const { id } = req.params;
            const issue = await this.issueService.getIssueById(id);
            res.status(200).json({
                success: true,
                data: { issue },
            });
        }
        catch (error) {
            next(error);
        }
    };
    update = async (req, res, next) => {
        try {
            const { id } = req.params;
            const issue = await this.issueService.updateIssue(id, req.body);
            res.status(200).json({
                success: true,
                data: { issue },
            });
        }
        catch (error) {
            next(error);
        }
    };
    delete = async (req, res, next) => {
        try {
            const { id } = req.params;
            await this.issueService.deleteIssue(id);
            res.status(200).json({
                success: true,
                message: 'Issue deleted successfully',
            });
        }
        catch (error) {
            next(error);
        }
    };
}

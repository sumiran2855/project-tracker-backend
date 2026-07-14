import { ProjectService } from '../services/ProjectService.js';
export class ProjectController {
    projectService;
    constructor() {
        this.projectService = new ProjectService();
    }
    create = async (req, res, next) => {
        try {
            const user = req.user;
            const project = await this.projectService.createProject(req.body, {
                id: user.userId,
                name: user.name,
            });
            res.status(201).json({
                success: true,
                data: { project },
            });
        }
        catch (error) {
            next(error);
        }
    };
    getAll = async (req, res, next) => {
        try {
            const userId = req.user.userId;
            const projects = await this.projectService.getProjectsForUser(userId);
            res.status(200).json({
                success: true,
                data: { projects },
            });
        }
        catch (error) {
            next(error);
        }
    };
    getById = async (req, res, next) => {
        try {
            const { id } = req.params;
            const userId = req.user.userId;
            const project = await this.projectService.getProjectById(id, userId);
            res.status(200).json({
                success: true,
                data: { project },
            });
        }
        catch (error) {
            next(error);
        }
    };
    update = async (req, res, next) => {
        try {
            const { id } = req.params;
            const userId = req.user.userId;
            const project = await this.projectService.updateProject(id, userId, req.body);
            res.status(200).json({
                success: true,
                data: { project },
            });
        }
        catch (error) {
            next(error);
        }
    };
    delete = async (req, res, next) => {
        try {
            const { id } = req.params;
            const userId = req.user.userId;
            await this.projectService.deleteProject(id, userId);
            res.status(200).json({
                success: true,
                message: 'Project deleted successfully',
            });
        }
        catch (error) {
            next(error);
        }
    };
    addMember = async (req, res, next) => {
        try {
            const { id } = req.params;
            const userId = req.user.userId;
            const { memberUserId, memberName } = req.body;
            const project = await this.projectService.addMember(id, userId, {
                id: memberUserId,
                name: memberName,
            });
            res.status(200).json({
                success: true,
                data: { project },
            });
        }
        catch (error) {
            next(error);
        }
    };
}

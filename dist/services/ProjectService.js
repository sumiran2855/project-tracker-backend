import { ProjectRepository } from '../repositories/ProjectRepository.js';
import { CustomError } from '../helpers/CustomError.js';
import { Types } from 'mongoose';
export class ProjectService {
    projectRepository;
    constructor() {
        this.projectRepository = new ProjectRepository();
    }
    async createProject(name, description, tags, dueDate, owner) {
        const ownerId = new Types.ObjectId(owner.id);
        const member = {
            userId: ownerId,
            name: owner.name,
            initials: owner.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'U',
            bg: 'bg-indigo-500',
        };
        return this.projectRepository.create({
            name,
            description,
            tags,
            dueDate,
            ownerId,
            members: [member],
        });
    }
    async getProjectsForUser(userId) {
        return this.projectRepository.find({
            $or: [
                { ownerId: new Types.ObjectId(userId) },
                { 'members.userId': new Types.ObjectId(userId) }
            ]
        });
    }
    async getProjectById(projectId, userId) {
        const project = await this.projectRepository.findById(projectId);
        if (!project) {
            throw new CustomError(404, 'Project not found');
        }
        return project;
    }
    async updateProject(projectId, userId, updateData) {
        const project = await this.projectRepository.findById(projectId);
        if (!project) {
            throw new CustomError(404, 'Project not found');
        }
        if (project.ownerId.toString() !== userId && !project.members.some(m => m.userId.toString() === userId)) {
            throw new CustomError(403, 'Access denied');
        }
        return this.projectRepository.update(projectId, updateData);
    }
    async deleteProject(projectId, userId) {
        const project = await this.projectRepository.findById(projectId);
        if (!project) {
            throw new CustomError(404, 'Project not found');
        }
        if (project.ownerId.toString() !== userId) {
            throw new CustomError(403, 'Only project owner can delete the project');
        }
        return this.projectRepository.delete(projectId);
    }
    async addMember(projectId, userId, newMemberUser) {
        const project = await this.projectRepository.findById(projectId);
        if (!project) {
            throw new CustomError(404, 'Project not found');
        }
        if (project.ownerId.toString() !== userId) {
            throw new CustomError(403, 'Only project owner can manage members');
        }
        if (project.members.some(m => m.userId.toString() === newMemberUser.id)) {
            throw new CustomError(400, 'User is already a project member');
        }
        const member = {
            userId: new Types.ObjectId(newMemberUser.id),
            name: newMemberUser.name,
            initials: newMemberUser.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'U',
            bg: 'bg-emerald-500',
        };
        project.members.push(member);
        await project.save();
        return project;
    }
}

import { IssueRepository } from '../repositories/IssueRepository.js';
import { ProjectRepository } from '../repositories/ProjectRepository.js';
import { CustomError } from '../helpers/CustomError.js';
import { Types } from 'mongoose';
export class IssueService {
    issueRepository;
    projectRepository;
    constructor() {
        this.issueRepository = new IssueRepository();
        this.projectRepository = new ProjectRepository();
    }
    async createIssue(title, description, status, priority, type, projectId, dueDate, assigneeUsers) {
        const project = await this.projectRepository.findById(projectId);
        if (!project) {
            throw new CustomError(404, 'Project not found');
        }
        const assignees = assigneeUsers.map(u => ({
            userId: new Types.ObjectId(u.id),
            name: u.name,
            initials: u.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'U',
            bg: 'bg-indigo-500',
        }));
        const issue = await this.issueRepository.create({
            title,
            description,
            status,
            priority,
            type,
            projectId: new Types.ObjectId(projectId),
            projectName: project.name,
            dueDate,
            assignees,
        });
        // Increment commentsCount or other properties on project if required
        return issue;
    }
    async getIssuesByProject(projectId) {
        return this.issueRepository.findByProject(projectId);
    }
    async getIssueById(issueId) {
        const issue = await this.issueRepository.findById(issueId);
        if (!issue) {
            throw new CustomError(404, 'Issue not found');
        }
        return issue;
    }
    async updateIssue(issueId, updateData) {
        const issue = await this.issueRepository.findById(issueId);
        if (!issue) {
            throw new CustomError(404, 'Issue not found');
        }
        if (updateData.assignees) {
            updateData.assignees = updateData.assignees.map((u) => ({
                userId: new Types.ObjectId(u.userId),
                name: u.name,
                initials: u.initials || u.name.split(' ').map((n) => n[0]).join('').toUpperCase().substring(0, 2),
                bg: u.bg || 'bg-indigo-500',
            }));
        }
        return this.issueRepository.update(issueId, updateData);
    }
    async deleteIssue(issueId) {
        const issue = await this.issueRepository.findById(issueId);
        if (!issue) {
            throw new CustomError(404, 'Issue not found');
        }
        return this.issueRepository.delete(issueId);
    }
}

import { CustomError } from '../helpers/CustomError.js';
import { Types } from 'mongoose';
export class IssueService {
    issueRepository;
    projectRepository;
    constructor(issueRepository, projectRepository) {
        this.issueRepository = issueRepository;
        this.projectRepository = projectRepository;
    }
    async createIssue(title, description, status, priority, type, projectId, dueDate, assigneeUsers, relatedTaskId, relatedTaskTitle, attachments) {
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
            relatedTaskId: relatedTaskId ? new Types.ObjectId(relatedTaskId) : undefined,
            relatedTaskTitle,
            attachments: attachments || [],
        });
        // Increment commentsCount or other properties on project if required
        return issue;
    }
    async getIssuesByProject(projectId) {
        return this.issueRepository.findByProject(projectId);
    }
    async getAllIssues() {
        return this.issueRepository.findAll();
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
        // Auto-record timestamped workLog if newWorkLog delta is provided
        if (updateData.newWorkLog) {
            const currentLogs = [...(issue.workLogs || [])];
            const newHrs = Number(updateData.newWorkLog.hours) || 0;
            currentLogs.push({
                hours: newHrs,
                date: updateData.newWorkLog.date ? new Date(updateData.newWorkLog.date) : new Date(),
                userName: updateData.newWorkLog.userName || updateData.updatedByUserName || '',
                userId: updateData.newWorkLog.userId || (updateData.updatedByUserId ? new Types.ObjectId(updateData.updatedByUserId) : undefined),
            });
            updateData.workLogs = currentLogs;
            updateData.actualHours = currentLogs.reduce((sum, log) => sum + (Number(log.hours) || 0), 0);
            delete updateData.newWorkLog;
        }
        else {
            // Enforce immutability and prevent metadata updates from overwriting hours or logs
            delete updateData.workLogs;
            delete updateData.actualHours;
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

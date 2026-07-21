import { IssueRepository } from '../repositories/IssueRepository.js';
import { ProjectRepository } from '../repositories/ProjectRepository.js';
import { CustomError } from '../helpers/CustomError.js';
import { Types } from 'mongoose';

export class IssueService {
  private issueRepository: IssueRepository;
  private projectRepository: ProjectRepository;

  constructor() {
    this.issueRepository = new IssueRepository();
    this.projectRepository = new ProjectRepository();
  }

  async createIssue(
    title: string,
    description: string,
    status: 'Open' | 'In Progress' | 'Resolved' | 'Closed',
    priority: 'Low' | 'Medium' | 'High' | 'Critical',
    type: 'Bug' | 'Task' | 'Improvement' | 'Security',
    projectId: string,
    dueDate: string,
    assigneeUsers: { id: string; name: string }[]
  ): Promise<any> {
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

  async getIssuesByProject(projectId: string): Promise<any[]> {
    return this.issueRepository.findByProject(projectId);
  }

  async getAllIssues(): Promise<any[]> {
    return this.issueRepository.findAll();
  }

  async getIssueById(issueId: string): Promise<any> {
    const issue = await this.issueRepository.findById(issueId);
    if (!issue) {
      throw new CustomError(404, 'Issue not found');
    }
    return issue;
  }

  async updateIssue(issueId: string, updateData: any): Promise<any> {
    const issue = await this.issueRepository.findById(issueId);
    if (!issue) {
      throw new CustomError(404, 'Issue not found');
    }

    if (updateData.assignees) {
      updateData.assignees = updateData.assignees.map((u: any) => ({
        userId: new Types.ObjectId(u.userId),
        name: u.name,
        initials: u.initials || u.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2),
        bg: u.bg || 'bg-indigo-500',
      }));
    }

    // Auto-record timestamped workLog if actualHours is updated or workLogs provided
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
      updateData.actualHours = currentLogs.reduce((acc: number, l: any) => acc + (l.hours || 0), 0);
      delete updateData.newWorkLog;
    } else if (typeof updateData.actualHours === 'number' && !updateData.workLogs) {
      const newHours = Math.max(0, updateData.actualHours);
      const currentLogs = (issue.workLogs || []).map((l: any) => ({ ...l }));
      const currentLogsSum = currentLogs.reduce((acc: number, l: any) => acc + (l.hours || 0), 0);

      if (newHours === 0) {
        updateData.workLogs = [];
      } else if (newHours > currentLogsSum) {
        const diff = newHours - currentLogsSum;
        currentLogs.push({
          hours: diff,
          date: new Date(),
          userName: updateData.updatedByUserName || '',
          userId: updateData.updatedByUserId ? new Types.ObjectId(updateData.updatedByUserId) : undefined,
        });
        updateData.workLogs = currentLogs;
      } else if (newHours < currentLogsSum) {
        let toRemove = currentLogsSum - newHours;
        for (let i = currentLogs.length - 1; i >= 0; i--) {
          if (toRemove <= 0) break;
          if (currentLogs[i].hours <= toRemove) {
            toRemove -= currentLogs[i].hours;
            currentLogs.splice(i, 1);
          } else {
            currentLogs[i].hours -= toRemove;
            toRemove = 0;
          }
        }
        if (newHours > 0 && currentLogs.length === 0) {
          currentLogs.push({
            hours: newHours,
            date: new Date(),
            userName: updateData.updatedByUserName || '',
            userId: updateData.updatedByUserId ? new Types.ObjectId(updateData.updatedByUserId) : undefined,
          });
        }
        updateData.workLogs = currentLogs;
      }
    }

    return this.issueRepository.update(issueId, updateData);
  }

  async deleteIssue(issueId: string): Promise<any> {
    const issue = await this.issueRepository.findById(issueId);
    if (!issue) {
      throw new CustomError(404, 'Issue not found');
    }

    return this.issueRepository.delete(issueId);
  }
}

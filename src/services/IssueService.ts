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

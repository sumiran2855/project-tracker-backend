import { ProjectRepository } from '../repositories/ProjectRepository.js';
import { CustomError } from '../helpers/CustomError.js';
import { Types } from 'mongoose';

export class ProjectService {
  private projectRepository: ProjectRepository;

  constructor() {
    this.projectRepository = new ProjectRepository();
  }

  mapMembers(members: any[]): any[] {
    const bgColors = ['bg-indigo-500', 'bg-emerald-500', 'bg-violet-500', 'bg-rose-500', 'bg-amber-500', 'bg-sky-500', 'bg-blue-500'];
    return members.map((m: any) => {
      let hash = 0;
      const name = m.name || '';
      for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
      }
      const index = Math.abs(hash) % bgColors.length;
      return {
        userId: new Types.ObjectId(m.userId),
        name: name,
        initials: m.initials || name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2) || 'M',
        bg: m.bg || bgColors[index],
      };
    });
  }

  async createProject(projectData: any, owner: { id: string; name: string }): Promise<any> {
    const ownerId = new Types.ObjectId(owner.id);
    
    // Map members list
    let memberList: any[] = [];
    if (projectData.members && Array.isArray(projectData.members)) {
      memberList = this.mapMembers(projectData.members);
    }
    
    // Make sure owner is in the members list
    if (!memberList.some(m => m.userId.toString() === owner.id)) {
      memberList.push({
        userId: ownerId,
        name: owner.name,
        initials: owner.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'U',
        bg: 'bg-indigo-500',
      });
    }

    return this.projectRepository.create({
      name: projectData.name,
      description: projectData.description,
      status: projectData.status || 'Planning',
      progress: projectData.progress || 0,
      tags: projectData.tags,
      dueDate: projectData.dueDate,
      priority: projectData.priority,
      techStack: projectData.techStack,
      budget: projectData.budget,
      repositoryUrl: projectData.repositoryUrl,
      slackChannel: projectData.slackChannel,
      startDate: projectData.startDate,
      targetQuarter: projectData.targetQuarter,
      ownerId,
      members: memberList,
    });
  }

  async getProjectsForUser(userId: string): Promise<any[]> {
    return this.projectRepository.find({
      $or: [
        { ownerId: new Types.ObjectId(userId) },
        { 'members.userId': new Types.ObjectId(userId) }
      ]
    });
  }

  async getProjectById(projectId: string, userId: string): Promise<any> {
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new CustomError(404, 'Project not found');
    }
    return project;
  }

  async updateProject(projectId: string, userId: string, updateData: any): Promise<any> {
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new CustomError(404, 'Project not found');
    }

    if (project.ownerId.toString() !== userId && !project.members.some(m => m.userId.toString() === userId)) {
      throw new CustomError(403, 'Access denied');
    }

    if (updateData.members && Array.isArray(updateData.members)) {
      updateData.members = this.mapMembers(updateData.members);
    }

    return this.projectRepository.update(projectId, updateData);
  }

  async deleteProject(projectId: string, userId: string): Promise<any> {
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new CustomError(404, 'Project not found');
    }

    if (project.ownerId.toString() !== userId) {
      throw new CustomError(403, 'Only project owner can delete the project');
    }

    return this.projectRepository.delete(projectId);
  }

  async addMember(projectId: string, userId: string, newMemberUser: { id: string; name: string }): Promise<any> {
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

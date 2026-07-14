import { Project, IProject } from '../models/Project.js';
import { BaseRepository } from './BaseRepository.js';

export class ProjectRepository extends BaseRepository<IProject> {
  constructor() {
    super(Project);
  }

  async findByMember(userId: string): Promise<IProject[]> {
    return this.find({
      'members.userId': userId,
    });
  }

  async findByOwner(ownerId: string): Promise<IProject[]> {
    return this.find({ ownerId });
  }

  async incrementTaskCounters(projectId: string, isCompleted: boolean): Promise<IProject | null> {
    const updateQuery: any = { $inc: { tasksCount: 1 } };
    if (isCompleted) {
      updateQuery.$inc.completedTasks = 1;
    }
    return this.update(projectId, updateQuery);
  }

  async decrementTaskCounters(projectId: string, isCompleted: boolean): Promise<IProject | null> {
    const updateQuery: any = { $inc: { tasksCount: -1 } };
    if (isCompleted) {
      updateQuery.$inc.completedTasks = -1;
    }
    return this.update(projectId, updateQuery);
  }

  async updateTaskCompletionStatus(projectId: string, wasCompleted: boolean, isNowCompleted: boolean): Promise<IProject | null> {
    if (wasCompleted === isNowCompleted) return null;
    
    return this.update(projectId, {
      $inc: { completedTasks: isNowCompleted ? 1 : -1 }
    });
  }
}

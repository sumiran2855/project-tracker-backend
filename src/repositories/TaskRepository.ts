import { Task, ITask } from '../models/Task.js';
import { BaseRepository } from './BaseRepository.js';

export class TaskRepository extends BaseRepository<ITask> {
  constructor() {
    super(Task);
  }

  async findByProject(projectId: string): Promise<ITask[]> {
    return this.find({ projectId });
  }

  async findByAssignee(userId: string): Promise<ITask[]> {
    return this.find({
      'assignees.userId': userId,
    });
  }
}

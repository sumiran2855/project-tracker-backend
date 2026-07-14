import { Issue, IIssue } from '../models/Issue.js';
import { BaseRepository } from './BaseRepository.js';

export class IssueRepository extends BaseRepository<IIssue> {
  constructor() {
    super(Issue);
  }

  async findByProject(projectId: string): Promise<IIssue[]> {
    return this.find({ projectId });
  }

  async findByAssignee(userId: string): Promise<IIssue[]> {
    return this.find({
      'assignees.userId': userId,
    });
  }
}

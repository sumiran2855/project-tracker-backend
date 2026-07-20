import { Issue } from '../models/Issue.js';
import { BaseRepository } from './BaseRepository.js';
export class IssueRepository extends BaseRepository {
    constructor() {
        super(Issue);
    }
    async findByProject(projectId) {
        return this.find({ projectId });
    }
    async findAll() {
        return this.find({});
    }
    async findByAssignee(userId) {
        return this.find({
            'assignees.userId': userId,
        });
    }
}

import { Task } from '../models/Task.js';
import { BaseRepository } from './BaseRepository.js';
export class TaskRepository extends BaseRepository {
    constructor() {
        super(Task);
    }
    async findByProject(projectId) {
        return this.find({ projectId });
    }
    async findByAssignee(userId) {
        return this.find({
            'assignees.userId': userId,
        });
    }
}

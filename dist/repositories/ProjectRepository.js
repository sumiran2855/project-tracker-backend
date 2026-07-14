import { Project } from '../models/Project.js';
import { BaseRepository } from './BaseRepository.js';
export class ProjectRepository extends BaseRepository {
    constructor() {
        super(Project);
    }
    async findByMember(userId) {
        return this.find({
            'members.userId': userId,
        });
    }
    async findByOwner(ownerId) {
        return this.find({ ownerId });
    }
    async incrementTaskCounters(projectId, isCompleted) {
        const updateQuery = { $inc: { tasksCount: 1 } };
        if (isCompleted) {
            updateQuery.$inc.completedTasks = 1;
        }
        return this.update(projectId, updateQuery);
    }
    async decrementTaskCounters(projectId, isCompleted) {
        const updateQuery = { $inc: { tasksCount: -1 } };
        if (isCompleted) {
            updateQuery.$inc.completedTasks = -1;
        }
        return this.update(projectId, updateQuery);
    }
    async updateTaskCompletionStatus(projectId, wasCompleted, isNowCompleted) {
        if (wasCompleted === isNowCompleted)
            return null;
        return this.update(projectId, {
            $inc: { completedTasks: isNowCompleted ? 1 : -1 }
        });
    }
}

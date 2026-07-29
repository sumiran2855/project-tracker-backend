import { CustomError } from '../helpers/CustomError.js';
import { Types } from 'mongoose';
export class TaskService {
    taskRepository;
    projectRepository;
    constructor(taskRepository, projectRepository) {
        this.taskRepository = taskRepository;
        this.projectRepository = projectRepository;
    }
    async recalculateProjectProgress(projectId) {
        const project = await this.projectRepository.findById(projectId);
        if (!project)
            return;
        const progress = project.tasksCount > 0
            ? Math.round((project.completedTasks / project.tasksCount) * 100)
            : 0;
        project.progress = progress;
        await project.save();
    }
    async createTask(title, description, status, priority, projectId, startDate, dueDate, assigneeUsers, subtasks = [], comments = [], actualHours) {
        const project = await this.projectRepository.findById(projectId);
        if (!project) {
            throw new CustomError(404, 'Project not found');
        }
        const assignees = assigneeUsers.map(u => {
            const rawId = u.userId || u.id;
            const isValidObjectId = rawId && Types.ObjectId.isValid(rawId);
            return {
                userId: isValidObjectId ? new Types.ObjectId(rawId) : new Types.ObjectId(),
                name: u.name,
                initials: u.initials || u.name.split(' ').map((n) => n[0]).join('').toUpperCase().substring(0, 2) || 'U',
                bg: u.bg || 'bg-indigo-500',
            };
        });
        const initialWorkLogs = (actualHours && actualHours > 0)
            ? [{ hours: actualHours, date: new Date() }]
            : [];
        const task = await this.taskRepository.create({
            title,
            description,
            status,
            priority,
            projectId: new Types.ObjectId(projectId),
            projectName: project.name,
            startDate,
            dueDate,
            assignees,
            subtasks,
            comments,
            actualHours,
            workLogs: initialWorkLogs,
        });
        const isCompleted = status === 'Done';
        await this.projectRepository.incrementTaskCounters(projectId, isCompleted);
        await this.recalculateProjectProgress(projectId);
        return task;
    }
    async getTasksByProject(projectId) {
        return this.taskRepository.findByProject(projectId);
    }
    async getAllTasks() {
        return this.taskRepository.findAll();
    }
    async getTaskById(taskId) {
        const task = await this.taskRepository.findById(taskId);
        if (!task) {
            throw new CustomError(404, 'Task not found');
        }
        return task;
    }
    async updateTask(taskId, updateData) {
        const task = await this.taskRepository.findById(taskId);
        if (!task) {
            throw new CustomError(404, 'Task not found');
        }
        const oldStatus = task.status;
        const newStatus = updateData.status ?? oldStatus;
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
            const currentLogs = [...(task.workLogs || [])];
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
        const updatedTask = await this.taskRepository.update(taskId, updateData);
        if (!updatedTask) {
            throw new CustomError(500, 'Failed to update task');
        }
        const projectIdStr = task.projectId.toString();
        const wasCompleted = oldStatus === 'Done';
        const isNowCompleted = newStatus === 'Done';
        await this.projectRepository.updateTaskCompletionStatus(projectIdStr, wasCompleted, isNowCompleted);
        await this.recalculateProjectProgress(projectIdStr);
        return updatedTask;
    }
    async deleteTask(taskId) {
        const task = await this.taskRepository.findById(taskId);
        if (!task) {
            throw new CustomError(404, 'Task not found');
        }
        const projectIdStr = task.projectId.toString();
        const isCompleted = task.status === 'Done';
        const deleted = await this.taskRepository.delete(taskId);
        await this.projectRepository.decrementTaskCounters(projectIdStr, isCompleted);
        await this.recalculateProjectProgress(projectIdStr);
        return deleted;
    }
}

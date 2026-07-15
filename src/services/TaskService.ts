import { TaskRepository } from '../repositories/TaskRepository.js';
import { ProjectRepository } from '../repositories/ProjectRepository.js';
import { CustomError } from '../helpers/CustomError.js';
import { Types } from 'mongoose';

export class TaskService {
  private taskRepository: TaskRepository;
  private projectRepository: ProjectRepository;

  constructor() {
    this.taskRepository = new TaskRepository();
    this.projectRepository = new ProjectRepository();
  }

  private async recalculateProjectProgress(projectId: string): Promise<void> {
    const project = await this.projectRepository.findById(projectId);
    if (!project) return;

    const progress = project.tasksCount > 0
      ? Math.round((project.completedTasks / project.tasksCount) * 100)
      : 0;

    project.progress = progress;
    await project.save();
  }

  async createTask(
    title: string,
    description: string,
    status: 'To Do' | 'In Progress' | 'In Review' | 'Done',
    priority: 'Low' | 'Medium' | 'High' | 'Urgent',
    projectId: string,
    startDate: string,
    dueDate: string,
    assigneeUsers: { id: string; name: string }[],
    subtasks: { id: string; title: string; completed: boolean }[] = [],
    comments: { id: string; author: string; initials: string; text: string; time: string }[] = [],
    actualHours?: number
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
    });

    const isCompleted = status === 'Done';
    await this.projectRepository.incrementTaskCounters(projectId, isCompleted);
    await this.recalculateProjectProgress(projectId);

    return task;
  }

  async getTasksByProject(projectId: string): Promise<any[]> {
    return this.taskRepository.findByProject(projectId);
  }

  async getTaskById(taskId: string): Promise<any> {
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new CustomError(404, 'Task not found');
    }
    return task;
  }

  async updateTask(taskId: string, updateData: any): Promise<any> {
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new CustomError(404, 'Task not found');
    }

    const oldStatus = task.status;
    const newStatus = updateData.status ?? oldStatus;

    if (updateData.assignees) {
      updateData.assignees = updateData.assignees.map((u: any) => ({
        userId: new Types.ObjectId(u.userId),
        name: u.name,
        initials: u.initials || u.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2),
        bg: u.bg || 'bg-indigo-500',
      }));
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

  async deleteTask(taskId: string): Promise<any> {
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

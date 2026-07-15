import { z } from 'zod';
export const RegisterSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
});
export const LoginSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});
export const UpdateRoleSchema = z.object({
    role: z.enum(['Employee', 'Admin', 'Manager', 'Team Lead', 'Client']),
});
export const ProjectCreateSchema = z.object({
    name: z.string().min(3, 'Project name must be at least 3 characters'),
    description: z.string().default(''),
    tags: z.array(z.string()).default([]),
    dueDate: z.string().default('No Due Date'),
    priority: z.enum(['Low', 'Medium', 'High', 'Critical']).default('Medium'),
    techStack: z.array(z.string()).default([]),
    budget: z.string().default(''),
    repositoryUrl: z.string().default(''),
    slackChannel: z.string().default(''),
    startDate: z.string().default(''),
    targetQuarter: z.string().default(''),
    members: z.array(z.object({
        userId: z.string(),
        name: z.string(),
        initials: z.string().optional(),
        bg: z.string().optional(),
    })).default([]),
});
export const ProjectUpdateSchema = z.object({
    name: z.string().min(3).optional(),
    description: z.string().optional(),
    status: z.enum(['Planning', 'In Progress', 'In Review', 'Completed']).optional(),
    progress: z.number().min(0).max(100).optional(),
    tags: z.array(z.string()).optional(),
    dueDate: z.string().optional(),
    priority: z.enum(['Low', 'Medium', 'High', 'Critical']).optional(),
    techStack: z.array(z.string()).optional(),
    budget: z.string().optional(),
    repositoryUrl: z.string().optional(),
    slackChannel: z.string().optional(),
    startDate: z.string().optional(),
    targetQuarter: z.string().optional(),
    members: z.array(z.object({
        userId: z.string(),
        name: z.string(),
        initials: z.string().optional(),
        bg: z.string().optional(),
    })).optional(),
});
export const TaskCreateSchema = z.object({
    title: z.string().min(1, 'Task title is required'),
    description: z.string().default(''),
    status: z.enum(['To Do', 'In Progress', 'In Review', 'Done']).default('To Do'),
    priority: z.enum(['Low', 'Medium', 'High', 'Urgent']).default('Medium'),
    projectId: z.string().min(1, 'Project ID is required'),
    startDate: z.string().default(''),
    dueDate: z.string().default(''),
    assignees: z.array(z.object({
        id: z.string(),
        name: z.string(),
    })).default([]),
    subtasks: z.array(z.object({
        id: z.string(),
        title: z.string(),
        completed: z.boolean().default(false),
    })).default([]),
    comments: z.array(z.object({
        id: z.string(),
        author: z.string(),
        initials: z.string(),
        text: z.string(),
        time: z.string(),
    })).default([]),
});
export const TaskUpdateSchema = z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    status: z.enum(['To Do', 'In Progress', 'In Review', 'Done']).optional(),
    priority: z.enum(['Low', 'Medium', 'High', 'Urgent']).optional(),
    startDate: z.string().optional(),
    dueDate: z.string().optional(),
    assignees: z.array(z.object({
        userId: z.string(),
        name: z.string(),
        initials: z.string().optional(),
        bg: z.string().optional(),
    })).optional(),
    subtasks: z.array(z.object({
        id: z.string(),
        title: z.string(),
        completed: z.boolean(),
    })).optional(),
    comments: z.array(z.object({
        id: z.string(),
        author: z.string(),
        initials: z.string(),
        text: z.string(),
        time: z.string(),
    })).optional(),
});
export const IssueCreateSchema = z.object({
    title: z.string().min(1, 'Issue title is required'),
    description: z.string().default(''),
    status: z.enum(['Open', 'In Progress', 'Resolved', 'Closed']).default('Open'),
    priority: z.enum(['Low', 'Medium', 'High', 'Critical']).default('Medium'),
    type: z.enum(['Bug', 'Task', 'Improvement', 'Security']).default('Bug'),
    projectId: z.string().min(1, 'Project ID is required'),
    dueDate: z.string().default(''),
    assignees: z.array(z.object({
        id: z.string(),
        name: z.string(),
    })).default([]),
});
export const IssueUpdateSchema = z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    status: z.enum(['Open', 'In Progress', 'Resolved', 'Closed']).optional(),
    priority: z.enum(['Low', 'Medium', 'High', 'Critical']).optional(),
    type: z.enum(['Bug', 'Task', 'Improvement', 'Security']).optional(),
    dueDate: z.string().optional(),
    assignees: z.array(z.object({
        userId: z.string(),
        name: z.string(),
        initials: z.string().optional(),
        bg: z.string().optional(),
    })).optional(),
});
export const ForgotPasswordSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
});
export const ResetPasswordSchema = z.object({
    token: z.string().min(1, 'Token is required'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
});

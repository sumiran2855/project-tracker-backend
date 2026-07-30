import { env } from './env.js';
import { UserRepository } from '../repositories/UserRepository.js';
import { ProjectRepository } from '../repositories/ProjectRepository.js';
import { TaskRepository } from '../repositories/TaskRepository.js';
import { IssueRepository } from '../repositories/IssueRepository.js';

import { ResendEmailProvider } from '../services/providers/ResendEmailProvider.js';
import { SmtpEmailProvider } from '../services/providers/SmtpEmailProvider.js';
import { MailService } from '../services/MailService.js';
import { AuthService } from '../services/AuthService.js';
import { ProjectService } from '../services/ProjectService.js';
import { TaskService } from '../services/TaskService.js';
import { IssueService } from '../services/IssueService.js';
import { ManagerService } from '../services/ManagerService.js';

import { AuthController } from '../controllers/AuthController.js';
import { ProjectController } from '../controllers/ProjectController.js';
import { TaskController } from '../controllers/TaskController.js';
import { IssueController } from '../controllers/IssueController.js';
import { ManagerController } from '../controllers/ManagerController.js';

// 1. Instantiate the dynamic Email Provider Strategy
const emailProvider = env.RESEND_API_KEY
  ? new ResendEmailProvider(
      env.RESEND_API_KEY,
      env.RESEND_SENDER_VERIFIED === 'true',
      env.SMTP_FROM
    )
  : new SmtpEmailProvider(
      {
        host: env.SMTP_HOST || '',
        port: env.SMTP_PORT,
        secure: env.SMTP_PORT === 465,
        auth: {
          user: env.SMTP_USER || '',
          pass: env.SMTP_PASS || '',
        },
      },
      env.SMTP_FROM
    );

// 2. Instantiate Repositories
export const userRepository = new UserRepository();
export const projectRepository = new ProjectRepository();
export const taskRepository = new TaskRepository();
export const issueRepository = new IssueRepository();

// 3. Instantiate Services
export const mailService = new MailService(emailProvider);
export const authService = new AuthService(userRepository, mailService);
export const projectService = new ProjectService(projectRepository);
export const taskService = new TaskService(taskRepository, projectRepository);
export const issueService = new IssueService(issueRepository, projectRepository);
export const managerService = new ManagerService(userRepository, projectRepository);

// 4. Instantiate Controllers
export const authController = new AuthController(authService);
export const projectController = new ProjectController(projectService);
export const taskController = new TaskController(taskService, projectService);
export const issueController = new IssueController(issueService, projectService);
export const managerController = new ManagerController(managerService);

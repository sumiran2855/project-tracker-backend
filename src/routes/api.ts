import { Router } from 'express';
import authRoutes from './authRoutes.js';
import projectRoutes from './projectRoutes.js';
import taskRoutes from './taskRoutes.js';
import issueRoutes from './issueRoutes.js';
import managerRoutes from './managerRoutes.js';

const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/projects', projectRoutes);
apiRouter.use('/tasks', taskRoutes);
apiRouter.use('/issues', issueRoutes);
apiRouter.use('/managers', managerRoutes);

export default apiRouter;

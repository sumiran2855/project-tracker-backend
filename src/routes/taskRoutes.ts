import { Router } from 'express';
import { TaskController } from '../controllers/TaskController.js';
import { validate } from '../middleware/validate.js';
import { TaskCreateSchema, TaskUpdateSchema } from '../helpers/validation.js';
import { requireAuth, checkPermission } from '../middleware/auth.js';

const router = Router();
const controller = new TaskController();

router.use(requireAuth);

router.get('/', checkPermission('project:view'), controller.getAll);
router.post('/', checkPermission('task:create'), validate(TaskCreateSchema), controller.create);
router.get('/project/:projectId', checkPermission('project:view'), controller.getByProject);
router.get('/:id', checkPermission('project:view'), controller.getById);
router.put('/:id', checkPermission('task:update-status'), validate(TaskUpdateSchema), controller.update);
router.delete('/:id', checkPermission('task:delete'), controller.delete);

export default router;

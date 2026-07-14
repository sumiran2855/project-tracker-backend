import { Router } from 'express';
import { TaskController } from '../controllers/TaskController.js';
import { validate } from '../middleware/validate.js';
import { TaskCreateSchema, TaskUpdateSchema } from '../helpers/validation.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const controller = new TaskController();

router.use(requireAuth);

router.post('/', validate(TaskCreateSchema), controller.create);
router.get('/project/:projectId', controller.getByProject);
router.get('/:id', controller.getById);
router.put('/:id', validate(TaskUpdateSchema), controller.update);
router.delete('/:id', controller.delete);

export default router;

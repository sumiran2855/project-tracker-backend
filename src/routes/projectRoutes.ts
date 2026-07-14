import { Router } from 'express';
import { ProjectController } from '../controllers/ProjectController.js';
import { validate } from '../middleware/validate.js';
import { ProjectCreateSchema, ProjectUpdateSchema } from '../helpers/validation.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const controller = new ProjectController();

router.use(requireAuth);

router.post('/', validate(ProjectCreateSchema), controller.create);
router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.put('/:id', validate(ProjectUpdateSchema), controller.update);
router.delete('/:id', controller.delete);
router.post('/:id/members', controller.addMember);

export default router;

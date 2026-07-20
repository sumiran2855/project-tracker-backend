import { Router } from 'express';
import { IssueController } from '../controllers/IssueController.js';
import { validate } from '../middleware/validate.js';
import { IssueCreateSchema, IssueUpdateSchema } from '../helpers/validation.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const controller = new IssueController();

router.use(requireAuth);

router.get('/', controller.getAll);
router.post('/', validate(IssueCreateSchema), controller.create);
router.get('/project/:projectId', controller.getByProject);
router.get('/:id', controller.getById);
router.put('/:id', validate(IssueUpdateSchema), controller.update);
router.delete('/:id', controller.delete);

export default router;

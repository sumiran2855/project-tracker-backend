import { Router } from 'express';
import { IssueController } from '../controllers/IssueController.js';
import { validate } from '../middleware/validate.js';
import { IssueCreateSchema, IssueUpdateSchema } from '../helpers/validation.js';
import { requireAuth, checkPermission } from '../middleware/auth.js';

const router = Router();
const controller = new IssueController();

router.use(requireAuth);

router.get('/', checkPermission('issue:view'), controller.getAll);
router.post('/', checkPermission('issue:view'), validate(IssueCreateSchema), controller.create);
router.get('/project/:projectId', checkPermission('project:view'), controller.getByProject);
router.get('/:id', checkPermission('issue:view'), controller.getById);
router.put('/:id', checkPermission('issue:view'), validate(IssueUpdateSchema), controller.update);
router.delete('/:id', checkPermission('issue:delete'), controller.delete);

export default router;

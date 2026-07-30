import { Router } from 'express';
import { managerController } from '../config/container.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();
const controller = managerController;

router.use(requireAuth);

// Manager team details (Placed first to avoid conflict with /:id)
router.get('/my-team', requireRole(['Manager']), controller.getMyTeam);

// Admin-only endpoints
router.get('/', requireRole(['Admin']), controller.getAll);
router.get('/:id', requireRole(['Admin']), controller.getById);
router.put('/:id/assignments', requireRole(['Admin']), controller.updateAssignments);

export default router;

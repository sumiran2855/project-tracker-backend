import { Router } from 'express';
import { IssueController } from '../controllers/IssueController.js';
import { validate } from '../middleware/validate.js';
import { IssueCreateSchema, IssueUpdateSchema } from '../helpers/validation.js';
import { requireAuth, checkPermission } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
const router = Router();
const controller = new IssueController();
// Configure multer storage and validation
const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            const dest = path.join(process.cwd(), 'uploads');
            if (!fs.existsSync(dest)) {
                fs.mkdirSync(dest, { recursive: true });
            }
            cb(null, dest);
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            cb(null, uniqueSuffix + path.extname(file.originalname));
        }
    }),
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        }
        else {
            cb(new Error('Only image files are allowed!'), false);
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});
router.use(requireAuth);
router.get('/', checkPermission('issue:view'), controller.getAll);
router.post('/upload', checkPermission('issue:view'), upload.single('file'), controller.uploadAttachment);
router.post('/', checkPermission('issue:view'), validate(IssueCreateSchema), controller.create);
router.get('/project/:projectId', checkPermission('project:view'), controller.getByProject);
router.get('/:id', checkPermission('issue:view'), controller.getById);
router.put('/:id', checkPermission('issue:view'), validate(IssueUpdateSchema), controller.update);
router.delete('/:id', checkPermission('issue:delete'), controller.delete);
export default router;

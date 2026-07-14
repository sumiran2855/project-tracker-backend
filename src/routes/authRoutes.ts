import { Router } from 'express';
import { AuthController } from '../controllers/AuthController.js';
import { validate } from '../middleware/validate.js';
import { RegisterSchema, LoginSchema, UpdateRoleSchema, ForgotPasswordSchema, ResetPasswordSchema } from '../helpers/validation.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const controller = new AuthController();

router.post('/register', validate(RegisterSchema), controller.register);
router.post('/login', validate(LoginSchema), controller.login);
router.get('/me', requireAuth, controller.getCurrentUser);
router.put('/role', requireAuth, validate(UpdateRoleSchema), controller.updateRole);
router.post('/forgot-password', validate(ForgotPasswordSchema), controller.forgotPassword);
router.post('/reset-password', validate(ResetPasswordSchema), controller.resetPassword);

export default router;

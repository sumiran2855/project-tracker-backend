import { Router } from 'express';
import { AuthController } from '../controllers/AuthController.js';
import { validate } from '../middleware/validate.js';
import { RegisterSchema, LoginSchema, UpdateRoleSchema, ForgotPasswordSchema, ResetPasswordSchema } from '../helpers/validation.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { rateLimiter } from '../middleware/rateLimiter.js';
const router = Router();
const controller = new AuthController();
// Strict rate limit for auth endpoints
const authRateLimit = rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 requests per window
    message: 'Too many authentication attempts, please try again after 15 minutes.',
});
router.post('/register', authRateLimit, validate(RegisterSchema), controller.register);
router.post('/login', authRateLimit, validate(LoginSchema), controller.login);
router.post('/refresh', controller.refresh);
router.post('/logout', requireAuth, controller.logout);
router.get('/me', requireAuth, controller.getCurrentUser);
router.get('/employees', requireAuth, controller.getEmployees);
router.put('/role', requireAuth, requireRole(['Admin']), validate(UpdateRoleSchema), controller.updateRole);
router.put('/profile', requireAuth, controller.updateProfile);
router.post('/collab/invite', requireAuth, controller.inviteCollaborator);
router.get('/collab/accept', controller.acceptCollaboration);
router.delete('/collab/remove', requireAuth, controller.removeCollaborator);
router.put('/notifications/state', requireAuth, controller.updateNotificationState);
router.put('/preferences', requireAuth, controller.updatePreferences);
router.post('/forgot-password', authRateLimit, validate(ForgotPasswordSchema), controller.forgotPassword);
router.post('/reset-password', authRateLimit, validate(ResetPasswordSchema), controller.resetPassword);
export default router;

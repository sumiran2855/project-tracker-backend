import { AuthService } from '../services/AuthService.js';
export class AuthController {
    authService;
    constructor() {
        this.authService = new AuthService();
    }
    register = async (req, res, next) => {
        try {
            const { name, email, password } = req.body;
            const data = await this.authService.register(name, email, password);
            res.status(201).json({
                success: true,
                data,
            });
        }
        catch (error) {
            next(error);
        }
    };
    login = async (req, res, next) => {
        try {
            const { email, password } = req.body;
            const data = await this.authService.login(email, password);
            res.status(200).json({
                success: true,
                data,
            });
        }
        catch (error) {
            next(error);
        }
    };
    getCurrentUser = async (req, res, next) => {
        try {
            const userId = req.user.userId;
            const user = await this.authService.findUserById(userId);
            res.status(200).json({
                success: true,
                data: { user },
            });
        }
        catch (error) {
            next(error);
        }
    };
    updateRole = async (req, res, next) => {
        try {
            const userId = req.user.userId;
            const { role } = req.body;
            const user = await this.authService.updateRole(userId, role);
            res.status(200).json({
                success: true,
                data: { user },
            });
        }
        catch (error) {
            next(error);
        }
    };
    updateNotificationState = async (req, res, next) => {
        try {
            const userId = req.user.userId;
            const { readNotifications, deletedNotifications } = req.body;
            const user = await this.authService.updateNotificationState(userId, readNotifications, deletedNotifications);
            res.status(200).json({
                success: true,
                data: { user },
            });
        }
        catch (error) {
            next(error);
        }
    };
    forgotPassword = async (req, res, next) => {
        try {
            const { email } = req.body;
            const token = await this.authService.forgotPassword(email);
            console.log(`[PASSWORD RESET LINK]: http://localhost:3000/reset-password?token=${token}`);
            res.status(200).json({
                success: true,
                message: 'Password reset link has been generated',
            });
        }
        catch (error) {
            next(error);
        }
    };
    resetPassword = async (req, res, next) => {
        try {
            const { token, password } = req.body;
            await this.authService.resetPassword(token, password);
            res.status(200).json({
                success: true,
                message: 'Password reset successful',
            });
        }
        catch (error) {
            next(error);
        }
    };
    getEmployees = async (req, res, next) => {
        try {
            const employees = await this.authService.getEmployees();
            res.status(200).json({
                success: true,
                data: { employees },
            });
        }
        catch (error) {
            next(error);
        }
    };
    updateProfile = async (req, res, next) => {
        try {
            const userId = req.user.userId;
            const { name, email, role, location, department, skills, collaborators } = req.body;
            const user = await this.authService.updateProfile(userId, { name, email, role, location, department, skills, collaborators });
            res.status(200).json({
                success: true,
                data: { user },
            });
        }
        catch (error) {
            next(error);
        }
    };
    inviteCollaborator = async (req, res, next) => {
        try {
            const userId = req.user.userId;
            const { email, name, role, bg, initials } = req.body;
            const user = await this.authService.inviteCollaborator(userId, { email, name, role, bg, initials });
            res.status(200).json({
                success: true,
                data: { user },
            });
        }
        catch (error) {
            next(error);
        }
    };
    acceptCollaboration = async (req, res, next) => {
        try {
            const { inviterId, inviteeId } = req.query;
            await this.authService.acceptCollaboration(inviterId, inviteeId);
            // Redirect to the frontend page
            const nextPublicUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
            res.redirect(`${nextPublicUrl}/profile?collabAccepted=true`);
        }
        catch (error) {
            next(error);
        }
    };
    removeCollaborator = async (req, res, next) => {
        try {
            const userId = req.user.userId;
            const email = (req.body.email || req.query.email);
            const user = await this.authService.removeCollaborator(userId, email);
            res.status(200).json({
                success: true,
                data: { user },
            });
        }
        catch (error) {
            next(error);
        }
    };
}

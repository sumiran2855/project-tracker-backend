import { verifyToken } from '../helpers/jwt.js';
import { CustomError } from '../helpers/CustomError.js';
export const ROLE_PERMISSIONS = {
    Admin: [
        'project:create',
        'project:view',
        'project:delete',
        'task:create',
        'task:assign',
        'task:update-status',
        'task:delete',
        'roadmap:manage',
        'roadmap:view',
        'report:view',
        'dashboard:view-team-workload',
        'dashboard:view-quick-actions',
        'settings:view',
        'issue:view',
        'issue:delete',
    ],
    Manager: [
        'project:create',
        'project:view',
        'project:delete',
        'task:create',
        'task:assign',
        'task:update-status',
        'task:delete',
        'roadmap:manage',
        'roadmap:view',
        'report:view',
        'dashboard:view-team-workload',
        'dashboard:view-quick-actions',
        'settings:view',
        'issue:view',
        'issue:delete',
    ],
    'Team Lead': [
        'project:create',
        'project:view',
        'task:create',
        'task:assign',
        'task:update-status',
        'task:delete',
        'roadmap:manage',
        'roadmap:view',
        'report:view',
        'dashboard:view-team-workload',
        'dashboard:view-quick-actions',
        'settings:view',
        'issue:view',
        'issue:delete',
    ],
    Client: [
        'project:create',
        'project:view',
        'task:create',
        'task:assign',
        'task:update-status',
        'roadmap:manage',
        'roadmap:view',
        'report:view',
        'dashboard:view-team-workload',
        'dashboard:view-quick-actions',
        'settings:view',
        'issue:view',
    ],
    Employee: [
        'project:view',
        'task:update-status',
        'roadmap:view',
        'settings:view',
        'issue:view',
    ],
};
export function requireAuth(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next(new CustomError(401, 'Unauthorized: No token provided'));
        }
        const token = authHeader.split(' ')[1];
        const payload = verifyToken(token);
        req.user = payload;
        next();
    }
    catch (error) {
        next(new CustomError(401, 'Unauthorized: Invalid token'));
    }
}
export function checkPermission(permission) {
    return (req, res, next) => {
        const user = req.user;
        if (!user || !user.role) {
            return next(new CustomError(403, 'Forbidden: No role assigned'));
        }
        const role = user.role;
        // Normalize role casing to find the matching allowed role
        const normalizedRole = Object.keys(ROLE_PERMISSIONS).find((r) => r.toLowerCase() === role.toLowerCase());
        if (!normalizedRole) {
            return next(new CustomError(403, 'Forbidden: Invalid role'));
        }
        const permissions = ROLE_PERMISSIONS[normalizedRole];
        if (!permissions || !permissions.includes(permission)) {
            return next(new CustomError(403, 'Forbidden: Insufficient permissions'));
        }
        next();
    };
}
export function requireRole(allowedRoles) {
    return (req, res, next) => {
        const user = req.user;
        if (!user || !user.role) {
            return next(new CustomError(403, 'Forbidden: No role assigned'));
        }
        const userRole = user.role;
        const isAllowed = allowedRoles.some((role) => role.toLowerCase() === userRole.toLowerCase());
        if (!isAllowed) {
            return next(new CustomError(403, 'Forbidden: Insufficient role permissions'));
        }
        next();
    };
}

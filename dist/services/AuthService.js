import bcrypt from 'bcryptjs';
import { UserRepository } from '../repositories/UserRepository.js';
import { CustomError } from '../helpers/CustomError.js';
import { generateToken } from '../helpers/jwt.js';
import { MailService } from './MailService.js';
export class AuthService {
    userRepository;
    mailService;
    constructor() {
        this.userRepository = new UserRepository();
        this.mailService = new MailService();
    }
    async register(name, email, password) {
        const existing = await this.userRepository.findByEmail(email);
        if (existing) {
            throw new CustomError(400, 'User with this email already exists');
        }
        const passwordHash = await bcrypt.hash(password, 10);
        // Seed database with first user as Admin if no users exist, otherwise default to Employee
        const allUsers = await this.userRepository.find();
        const role = allUsers.length === 0 ? 'Admin' : 'Employee';
        const user = await this.userRepository.create({
            name,
            email,
            passwordHash,
            role,
        });
        const token = generateToken({
            userId: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
        });
        return { user, token };
    }
    async login(email, password) {
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new CustomError(401, 'Invalid email or password');
        }
        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
            throw new CustomError(401, 'Invalid email or password');
        }
        const token = generateToken({
            userId: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
        });
        user.lastLogin = new Date();
        await user.save();
        return { user, token };
    }
    async updateRole(userId, newRole) {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new CustomError(404, 'User not found');
        }
        user.role = newRole;
        await user.save();
        return user;
    }
    async updateNotificationState(userId, readNotifications, deletedNotifications) {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new CustomError(404, 'User not found');
        }
        if (readNotifications !== undefined) {
            user.readNotifications = readNotifications;
        }
        if (deletedNotifications !== undefined) {
            user.deletedNotifications = deletedNotifications;
        }
        await user.save();
        return user;
    }
    async updatePreferences(userId, data) {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new CustomError(404, 'User not found');
        }
        if (data.workspacePrefs !== undefined) {
            user.workspacePrefs = {
                ...user.workspacePrefs,
                ...data.workspacePrefs,
            };
            user.markModified('workspacePrefs');
        }
        if (data.notificationPrefs !== undefined) {
            user.notificationPrefs = {
                ...user.notificationPrefs,
                ...data.notificationPrefs,
            };
            user.markModified('notificationPrefs');
        }
        await user.save();
        return user;
    }
    async findUserById(userId) {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new CustomError(404, 'User not found');
        }
        return user;
    }
    async forgotPassword(email) {
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new CustomError(404, 'User with this email not found');
        }
        const resetToken = crypto.randomUUID();
        user.resetToken = resetToken;
        user.resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour
        await user.save();
        await this.mailService.sendPasswordResetEmail(email, resetToken, user.name);
        return resetToken;
    }
    async resetPassword(token, newPassword) {
        const user = await this.userRepository.findByResetToken(token);
        if (!user) {
            throw new CustomError(400, 'Invalid or expired password reset token');
        }
        user.passwordHash = await bcrypt.hash(newPassword, 10);
        user.resetToken = undefined;
        user.resetTokenExpires = undefined;
        await user.save();
    }
    async getEmployees() {
        const users = await this.userRepository.find();
        const bgColors = ['bg-indigo-500', 'bg-emerald-500', 'bg-violet-500', 'bg-rose-500', 'bg-amber-500', 'bg-sky-500', 'bg-blue-500'];
        return users.map(u => {
            let hash = 0;
            const name = u.name || '';
            for (let i = 0; i < name.length; i++) {
                hash = name.charCodeAt(i) + ((hash << 5) - hash);
            }
            const index = Math.abs(hash) % bgColors.length;
            return {
                id: u.id,
                name: u.name,
                email: u.email,
                role: u.role,
                initials: name.split(' ').map((n) => n[0]).join('').toUpperCase().substring(0, 2) || 'U',
                bg: bgColors[index],
            };
        });
    }
    async updateProfile(userId, updateData) {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new CustomError(404, 'User not found');
        }
        if (updateData.name !== undefined)
            user.name = updateData.name;
        if (updateData.email !== undefined)
            user.email = updateData.email;
        if (updateData.role !== undefined)
            user.role = updateData.role;
        if (updateData.location !== undefined)
            user.location = updateData.location;
        if (updateData.department !== undefined)
            user.department = updateData.department;
        if (updateData.skills !== undefined)
            user.skills = updateData.skills;
        if (updateData.collaborators !== undefined)
            user.collaborators = updateData.collaborators;
        await user.save();
        return user;
    }
    async inviteCollaborator(userId, inviteeData) {
        const inviter = await this.userRepository.findById(userId);
        if (!inviter) {
            throw new CustomError(404, 'Inviter not found');
        }
        const inviteeUser = await this.userRepository.findByEmail(inviteeData.email);
        if (!inviteeUser) {
            throw new CustomError(404, 'User with this email is not registered');
        }
        // Initialize list
        if (!inviter.collaborators) {
            inviter.collaborators = [];
        }
        // Check if already exists in collaborators list
        const existing = inviter.collaborators.find(c => c.email.toLowerCase() === inviteeData.email.toLowerCase());
        if (existing) {
            if (existing.status === 'Accepted') {
                throw new CustomError(400, 'Already collaborating with this user');
            }
            else {
                throw new CustomError(400, 'Collaboration invitation already pending');
            }
        }
        // Add as pending collaborator
        inviter.collaborators.push({
            name: inviteeData.name,
            email: inviteeData.email.toLowerCase(),
            role: inviteeData.role,
            bg: inviteeData.bg,
            initials: inviteeData.initials,
            status: 'Pending'
        });
        inviter.markModified('collaborators');
        await inviter.save();
        const acceptUrl = `https://project-tracker-backend-d85g.onrender.com/api/auth/collab/accept?inviterId=${inviter.id}&inviteeId=${inviteeUser.id}`;
        // Log the accept URL for testing in local environment
        console.log(`[COLLABORATION ACCEPT URL]: ${acceptUrl}`);
        await this.mailService.sendCollaborationInvitationEmail(inviteeData.email, inviter.name, inviter.email, acceptUrl);
        return inviter;
    }
    async acceptCollaboration(inviterId, inviteeId) {
        const inviter = await this.userRepository.findById(inviterId);
        const invitee = await this.userRepository.findById(inviteeId);
        if (!inviter || !invitee) {
            throw new CustomError(404, 'User not found');
        }
        // 1. Update invitee in inviter's collaborators list
        if (inviter.collaborators) {
            const inviterCollab = inviter.collaborators.find(c => c.email.toLowerCase() === invitee.email.toLowerCase());
            if (inviterCollab) {
                inviterCollab.status = 'Accepted';
                inviter.markModified('collaborators');
                await inviter.save();
            }
        }
        // 2. Also add inviter to invitee's collaborators list if not already present, and set to Accepted
        if (!invitee.collaborators) {
            invitee.collaborators = [];
        }
        const inviteeCollab = invitee.collaborators.find(c => c.email.toLowerCase() === inviter.email.toLowerCase());
        if (inviteeCollab) {
            inviteeCollab.status = 'Accepted';
        }
        else {
            let hash = 0;
            const name = inviter.name || '';
            for (let i = 0; i < name.length; i++) {
                hash = name.charCodeAt(i) + ((hash << 5) - hash);
            }
            const bgColors = ['bg-indigo-500', 'bg-emerald-500', 'bg-violet-500', 'bg-rose-500', 'bg-amber-500', 'bg-sky-500', 'bg-blue-500'];
            const index = Math.abs(hash) % bgColors.length;
            invitee.collaborators.push({
                name: inviter.name,
                email: inviter.email,
                role: inviter.role,
                bg: bgColors[index],
                initials: inviter.name.split(' ').map((n) => n[0]).join('').toUpperCase().substring(0, 2) || 'U',
                status: 'Accepted'
            });
        }
        invitee.markModified('collaborators');
        await invitee.save();
    }
    async removeCollaborator(userId, colleagueEmail) {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new CustomError(404, 'User not found');
        }
        if (user.collaborators) {
            user.collaborators = user.collaborators.filter(c => c.email.toLowerCase() !== colleagueEmail.toLowerCase());
            user.markModified('collaborators');
            await user.save();
        }
        // Also remove from the colleague's collaborators list if they were collaborating
        const colleague = await this.userRepository.findByEmail(colleagueEmail);
        if (colleague && colleague.collaborators) {
            colleague.collaborators = colleague.collaborators.filter(c => c.email.toLowerCase() !== user.email.toLowerCase());
            colleague.markModified('collaborators');
            await colleague.save();
        }
        return user;
    }
}

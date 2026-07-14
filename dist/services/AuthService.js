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
}

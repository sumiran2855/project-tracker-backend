import bcrypt from 'bcryptjs';
import { UserRepository } from '../repositories/UserRepository.js';
import { CustomError } from '../helpers/CustomError.js';
import { generateToken } from '../helpers/jwt.js';
export class AuthService {
    userRepository;
    constructor() {
        this.userRepository = new UserRepository();
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
}

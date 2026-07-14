import { User } from '../models/User.js';
import { BaseRepository } from './BaseRepository.js';
export class UserRepository extends BaseRepository {
    constructor() {
        super(User);
    }
    async findByEmail(email) {
        return this.findOne({ email });
    }
    async findByResetToken(token) {
        return this.findOne({
            resetToken: token,
            resetTokenExpires: { $gt: new Date() },
        });
    }
}

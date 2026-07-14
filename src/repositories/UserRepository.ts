import { User, IUser } from '../models/User.js';
import { BaseRepository } from './BaseRepository.js';

export class UserRepository extends BaseRepository<IUser> {
  constructor() {
    super(User);
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return this.findOne({ email });
  }

  async findByResetToken(token: string): Promise<IUser | null> {
    return this.findOne({
      resetToken: token,
      resetTokenExpires: { $gt: new Date() },
    });
  }
}

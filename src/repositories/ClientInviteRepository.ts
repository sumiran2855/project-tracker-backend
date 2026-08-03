import { ClientInvite, IClientInvite } from '../models/ClientInvite.js';
import { BaseRepository } from './BaseRepository.js';

export class ClientInviteRepository extends BaseRepository<IClientInvite> {
  constructor() {
    super(ClientInvite);
  }

  async findValidToken(token: string): Promise<IClientInvite | null> {
    return this.findOne({
      token,
      isUsed: false,
      expiresAt: { $gt: new Date() },
    });
  }
}

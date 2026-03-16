import { isAdmin, isAdminByEmailOrId, COHOST_PERMISSIONS } from '../utils/permissions';
import type { CoHostRepository } from '../repositories/CoHostRepository';

export type ProfileRole = 'admin' | 'cohost' | 'user';

export interface MeProfile {
  user: { id: string; email: string; name: string | null };
  role: ProfileRole;
  permissions: string[];
}

interface UserLike {
  id: string;
  email: string;
  name?: string | null;
}

export class MeService {
  constructor(private readonly coHostRepo: CoHostRepository) {}

  async getProfile(user: UserLike): Promise<MeProfile> {
    const admin = isAdmin(user.id) || isAdminByEmailOrId(user.id, user.email);
    let permissions: string[] = [];
    let role: ProfileRole = 'user';
    if (admin) {
      role = 'admin';
      permissions = [...COHOST_PERMISSIONS];
    } else {
      const coHost = await this.coHostRepo.findByUserId(user.id);
      if (coHost) {
        role = 'cohost';
        try {
          permissions = coHost.permissions ? (JSON.parse(coHost.permissions) as string[]) : [];
        } catch {
          permissions = [];
        }
      }
    }
    return {
      user: { id: user.id, email: user.email, name: user.name ?? null },
      role,
      permissions,
    };
  }
}

import type { UserRepository } from '../repositories/UserRepository';
import type { CoHostRepository } from '../repositories/CoHostRepository';
import { ERROR_CODES } from '../errors';

export interface CoHostAddInput {
  user_id?: string;
  email?: string;
  display_name?: string;
}

export interface CoHostListItem {
  user_id: string;
  user_email: string;
  user_name: string | null;
  display_name: string | null;
  added_by: string | null;
  permissions: string[];
  created_at: string;
}

export class CoHostService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly coHostRepo: CoHostRepository
  ) {}

  async list(): Promise<CoHostListItem[]> {
    const list = await this.coHostRepo.getAll();
    return list.map((c) => ({
      user_id: c.user_id,
      user_email: c.user_email ?? '',
      user_name: c.user_name ?? null,
      display_name: c.display_name,
      added_by: c.added_by,
      permissions: this._parsePermissions(c.permissions),
      created_at: c.created_at,
    }));
  }

  async add(
    addedByUserId: string,
    input: CoHostAddInput
  ): Promise<
    | { message: 'Co-host added'; co_host: { user_id: string; email: string; display_name: string | null } }
    | { message: 'Co-host updated'; co_host: { user_id: string; email: string; display_name: string | null } }
  > {
    const { user_id, email, display_name } = input;
    if (!user_id && !email) {
      const err = new Error('Provide user_id or email') as Error & { code?: string };
      err.code = ERROR_CODES.MISSING_IDENTITY;
      throw err;
    }
    let targetUser: Awaited<ReturnType<UserRepository['findById']>> = null;
    if (user_id) {
      targetUser = await this.userRepo.findById(user_id);
    } else {
      targetUser = await this.userRepo.findByEmail(email);
    }
    if (!targetUser) {
      const err = new Error('User not found') as Error & { code?: string };
      err.code = ERROR_CODES.USER_NOT_FOUND;
      throw err;
    }
    if (targetUser.id === addedByUserId) {
      const err = new Error('Cannot add yourself as co-host') as Error & { code?: string };
      err.code = ERROR_CODES.CANNOT_ADD_SELF;
      throw err;
    }
    const existing = await this.coHostRepo.findByUserId(targetUser.id);
    if (existing) {
      await this.coHostRepo.add(
        targetUser.id,
        addedByUserId,
        display_name ?? existing.display_name
      );
      return {
        message: 'Co-host updated',
        co_host: {
          user_id: targetUser.id,
          email: targetUser.email,
          display_name: display_name ?? existing.display_name,
        },
      };
    }
    await this.coHostRepo.add(targetUser.id, addedByUserId, display_name ?? null);
    return {
      message: 'Co-host added',
      co_host: {
        user_id: targetUser.id,
        email: targetUser.email,
        display_name: display_name ?? null,
      },
    };
  }

  async remove(userId: string): Promise<{ removed: true } | null> {
    const removed = await this.coHostRepo.remove(userId);
    return removed ? { removed: true } : null;
  }

  async getPermissions(userId: string): Promise<{ user_id: string; permissions: string[] } | null> {
    const coHost = await this.coHostRepo.findByUserId(userId);
    if (!coHost) return null;
    return {
      user_id: userId,
      permissions: this._parsePermissions(coHost.permissions),
    };
  }

  async updatePermissions(
    userId: string,
    permissions: string[]
  ): Promise<{ user_id: string; permissions: string[] } | null> {
    const coHost = await this.coHostRepo.findByUserId(userId);
    if (!coHost) return null;
    const perms = Array.isArray(permissions)
      ? permissions.filter((p) => typeof p === 'string')
      : [];
    await this.coHostRepo.updatePermissions(userId, perms);
    return { user_id: userId, permissions: perms };
  }

  private _parsePermissions(permissionsJson: string | null): string[] {
    if (!permissionsJson) return [];
    try {
      const p = JSON.parse(permissionsJson) as unknown;
      return Array.isArray(p) ? (p as string[]).filter((x) => typeof x === 'string') : [];
    } catch {
      return [];
    }
  }
}

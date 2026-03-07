import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';
import type { UserRepository } from '../repositories/UserRepository';
import { ERROR_CODES } from '../errors';

export class AuthService {
  constructor(private readonly userRepo: UserRepository) {}

  async register({
    email,
    password,
    name = null,
  }: {
    email: string;
    password: string;
    name?: string | null;
  }): Promise<{ user: { id: string; email: string; name: string | null }; token: string }> {
    const normalized = (email || '').trim().toLowerCase();
    const existing = await this.userRepo.findByEmail(normalized);
    if (existing) {
      const err = new Error('Email already registered') as Error & { code?: string };
      err.code = ERROR_CODES.EMAIL_EXISTS;
      throw err;
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await this.userRepo.create({
      email: normalized,
      passwordHash,
      name: name || null,
    });
    const token = this._signToken(user);
    return {
      user: { id: user.id, email: user.email, name: user.name },
      token,
    };
  }

  async login({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<{ user: { id: string; email: string; name: string | null }; token: string }> {
    const normalized = (email || '').trim().toLowerCase();
    const user = await this.userRepo.findByEmail(normalized);
    if (!user || !user.password_hash) {
      const err = new Error('Invalid email or password') as Error & { code?: string };
      err.code = ERROR_CODES.INVALID_CREDENTIALS;
      throw err;
    }
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      const err = new Error('Invalid email or password') as Error & { code?: string };
      err.code = ERROR_CODES.INVALID_CREDENTIALS;
      throw err;
    }
    const token = this._signToken(user);
    return {
      user: { id: user.id, email: user.email, name: user.name },
      token,
    };
  }

  private _signToken(user: { id: string; email: string }): string {
    return jwt.sign(
      { sub: user.id, email: (user.email || '').toLowerCase() },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn } as jwt.SignOptions
    );
  }
}

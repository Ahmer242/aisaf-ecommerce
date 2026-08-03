import bcrypt from "bcrypt";
import type { LoginInput, RegisterInput, UserPublic } from "@aisaf/shared";
import { Errors } from "../../utils/AppError.js";
import { signAuthToken } from "../../utils/token.js";
import { authRepository } from "./auth.repository.js";

const BCRYPT_ROUNDS = 12;

function toPublic(user: {
  id: string;
  email: string;
  name: string | null;
  role: UserPublic["role"];
  image: string | null;
  createdAt: Date;
}): UserPublic {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    image: user.image,
    createdAt: user.createdAt,
  };
}

export class AuthService {
  async register(input: RegisterInput): Promise<{ user: UserPublic; token: string }> {
    const existing = await authRepository.findByEmail(input.email);
    if (existing) {
      throw Errors.conflict("EMAIL_TAKEN", "An account with this email already exists.");
    }

    const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
    const user = await authRepository.create({
      email: input.email,
      passwordHash,
      name: input.name,
    });

    const token = signAuthToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    return { user: toPublic(user), token };
  }

  async login(input: LoginInput): Promise<{ user: UserPublic; token: string }> {
    const user = await authRepository.findByEmail(input.email);
    if (!user?.passwordHash) {
      throw Errors.unauthorized("Invalid email or password.");
    }

    const ok = await bcrypt.compare(input.password, user.passwordHash);
    if (!ok) {
      throw Errors.unauthorized("Invalid email or password.");
    }

    const token = signAuthToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    return { user: toPublic(user), token };
  }

  async me(userId: string): Promise<UserPublic> {
    const user = await authRepository.findById(userId);
    if (!user) {
      throw Errors.notFound("USER_NOT_FOUND", "User not found.");
    }
    return toPublic(user);
  }
}

export const authService = new AuthService();

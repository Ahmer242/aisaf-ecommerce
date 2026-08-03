import type { Role, User } from "@prisma/client";
import { prisma } from "../../prisma/client.js";

export type CreateUserData = {
  email: string;
  passwordHash: string;
  name?: string;
  role?: Role;
};

export class AuthRepository {
  findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  }

  findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  create(data: CreateUserData): Promise<User> {
    return prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        passwordHash: data.passwordHash,
        name: data.name,
        role: data.role ?? "CUSTOMER",
      },
    });
  }
}

export const authRepository = new AuthRepository();

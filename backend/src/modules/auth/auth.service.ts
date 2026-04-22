import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../../config/prisma.js";
import { env } from "../../config/env.js";
import type { LoginInput } from "./auth.schema.js";

export const loginAdmin = async (payload: LoginInput) => {
  const admin = await prisma.admin.findUnique({
    where: { email: payload.email }
  });

  if (!admin) {
    throw new Error("Invalid email or password");
  }

  const passwordMatched = await bcrypt.compare(payload.password, admin.passwordHash);
  if (!passwordMatched) {
    throw new Error("Invalid email or password");
  }
const expiresIn = env.jwtExpiresIn as Exclude<jwt.SignOptions["expiresIn"], undefined>;

  const token = jwt.sign(
    {
      adminId: admin.id,
      email: admin.email
    },
    env.jwtSecret,
    { expiresIn}
  );

  return {
    token,
    admin: {
      id: admin.id,
      name: admin.name,
      email: admin.email
    }
  };
};

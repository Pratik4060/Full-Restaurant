import dotenv from "dotenv";

dotenv.config();

const requiredVars = ["DATABASE_URL", "JWT_SECRET"];

for (const key of requiredVars) {
  if (!process.env[key]) {
    throw new Error(`Missing required env variable: ${key}`);
  }
}

export const env = {
  port: Number(process.env.PORT ?? 5000),
  jwtSecret: process.env.JWT_SECRET as string,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d"
};

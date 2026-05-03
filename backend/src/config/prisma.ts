import { PrismaClient } from "@prisma/client";

const withPoolerSafeParams = (databaseUrl?: string) => {
  if (!databaseUrl) return undefined;

  try {
    const url = new URL(databaseUrl);
    const isSupabasePooler =
      url.hostname.includes("pooler.supabase.com") || url.port === "6543";

    if (isSupabasePooler) {
      if (!url.searchParams.has("pgbouncer")) {
        url.searchParams.set("pgbouncer", "true");
      }

      if (!url.searchParams.has("connection_limit")) {
        url.searchParams.set("connection_limit", "5");
      }
    }

    return url.toString();
  } catch {
    return databaseUrl;
  }
};

const databaseUrl = withPoolerSafeParams(process.env.DATABASE_URL);

export const prisma = new PrismaClient(
  databaseUrl
    ? {
        datasources: {
          db: {
            url: databaseUrl,
          },
        },
      }
    : undefined
);

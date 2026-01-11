import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

// Ensure we pass parameters to PrismaClient to support pgbouncer
// Force pgbouncer mode by appending args if missing
let connectionString = process.env.DATABASE_URL || "";
if (connectionString && !connectionString.includes("pgbouncer=true")) {
    connectionString += (connectionString.includes("?") ? "&" : "?") + "pgbouncer=true&connection_limit=1";
}

// Fallback hardcoded string (safety net)
if (!connectionString) {
    connectionString = "postgresql://postgres.fkhgaiyyuaxydzxlclvy:Neurasec823$@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres?pgbouncer=true&connection_limit=1";
}

export const prisma = global.prisma || new PrismaClient({
    datasources: {
        db: {
            url: connectionString
        }
    }
});

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

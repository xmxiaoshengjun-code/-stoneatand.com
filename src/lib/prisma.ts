import { PrismaClient } from '@prisma/client';

/**
 * Prisma Client singleton.
 *
 * In development, Next.js hot-reloading can create multiple PrismaClient
 * instances, leading to connection exhaustion. This pattern stores the
 * instance on the global object to reuse it across hot reloads.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

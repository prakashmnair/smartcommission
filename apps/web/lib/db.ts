import 'server-only'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

// Lazy singleton — defers construction until first use so the module can be
// imported during Next.js build without DATABASE_URL being set.
// Prisma v7 requires a driver adapter instead of url in schema.prisma.
export const db: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    if (!globalForPrisma.prisma) {
      const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
      globalForPrisma.prisma = new PrismaClient({ adapter })
    }
    return (globalForPrisma.prisma as unknown as Record<string, unknown>)[prop as string]
  },
})

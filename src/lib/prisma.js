import { PrismaClient } from '@prisma/client'

let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      log: process.env.DEBUG_PRISMA ? ['query', 'info', 'warn', 'error'] : ['error'],
    });
  }
  prisma = global.prisma;
}

const requiredModels = [
  'pageContent', 'businessCategory', 'stat',
  'news', 'csrProgram', 'investorContent', 'adminUser',
]

for (const m of requiredModels) {
  if (!(m in prisma)) {
    console.warn(`[prisma] Model '${m}' missing from Prisma client. Run 'npx prisma generate' or restart 'next dev' after clearing .next cache.`)
  }
}

export default prisma;

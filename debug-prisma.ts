import { prisma } from './lib/prisma.js';

async function debug() {
  console.log('Prisma keys:', Object.keys(prisma));
  console.log('User model:', !!(prisma as any).user);
  console.log('Stock model:', !!(prisma as any).stock);
}

debug().catch(console.error);

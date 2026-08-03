import { defineConfig } from '@prisma/config';

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:Divi@1998@localhost:5432/busflow?schema=public',
  },
  migrations: {
    seed: 'npx ts-node ./prisma/seed.ts',
  },
});

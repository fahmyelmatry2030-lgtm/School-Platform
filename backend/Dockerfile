# Backend Dockerfile for NestJS + Prisma
FROM node:20-alpine AS base

# Enable corepack (pnpm)
RUN corepack enable && corepack prepare pnpm@8.15.8 --activate

WORKDIR /app
COPY package.json pnpm-lock.yaml* package-lock.json* yarn.lock* ./

# Prefer pnpm, fallback to npm if lockfile not present
RUN if [ -f pnpm-lock.yaml ]; then pnpm install --frozen-lockfile; \
    else npm install; fi

COPY . .

# Generate Prisma client (if prisma present)
RUN if [ -d prisma ]; then npx prisma generate || pnpm dlx prisma generate || true; fi

# Build Typescript if present
RUN if [ -f tsconfig.build.json ]; then npm run build || pnpm run build; fi

EXPOSE 3000
CMD ["node", "dist/main.js"]

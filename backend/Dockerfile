FROM node:24-bookworm-slim AS build

WORKDIR /app
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build"

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json prisma.config.ts ./
COPY prisma ./prisma
COPY src ./src

RUN npm run prisma:generate && npm run build && npm prune --omit=dev

FROM node:24-bookworm-slim AS runtime

WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/prisma.config.ts ./prisma.config.ts

EXPOSE 3333
CMD ["sh", "-c", "npm run db:deploy && npm start"]

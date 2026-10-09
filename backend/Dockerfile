FROM node:20-alpine

ENV NODE_ENV=production
WORKDIR /app/backend

COPY backend/package.json backend/package-lock.json ./
RUN npm ci --omit=dev
RUN npm ls dotenv drizzle-orm pg express --depth=0

COPY backend/ ./

EXPOSE 10000
CMD ["node", "src/server.js"]
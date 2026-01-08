FROM node:20 AS builder

WORKDIR /app

COPY package*.json ./
# Run npm install first to leverage cache
RUN npm install

# Copy source
COPY . .

# Generate Prisma Client (uses schema from copied source)
RUN npx prisma generate
RUN npm run build

FROM node:20

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
# Copy prisma folder for migrations in runtime
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

CMD ["/bin/sh", "-c", "npx prisma migrate deploy && npm run start:prod"]

FROM node:24-alpine

ENV NODE_ENV=production
WORKDIR /app

# Deps first, so this layer is cached until the lockfile changes
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY . .

# The node image already ships a non-root "node" user
USER node

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/health || exit 1

# Not "npm start" — that runs nodemon, which is a devDependency
CMD ["node", "index.js"]

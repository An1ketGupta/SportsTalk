FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install
RUN npm install -g typescript
COPY . .
RUN npm run build
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./

RUN npm install --production

COPY --from=builder /app/dist ./dist

EXPOSE 3001
CMD ["node", "./dist/index.js"]
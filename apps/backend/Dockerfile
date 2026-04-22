FROM node:20-alpine

WORKDIR /app

COPY package.json ./
COPY apps/backend/package.json ./apps/backend/package.json
COPY packages/shared/package.json ./packages/shared/package.json

RUN npm install

COPY apps/backend ./apps/backend
COPY packages/shared ./packages/shared

WORKDIR /app/apps/backend

RUN npm run build

EXPOSE 4000

CMD ["npm", "run", "start"]
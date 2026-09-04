FROM node:20-slim

RUN apt-get update -y && apt-get install -y openssl

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

COPY . .

RUN npx prisma generate
RUN npm run build

EXPOSE 3000
EXPOSE 8080

CMD ["sh", "-c", "npx prisma db push --accept-data-loss || true; node dist/main.js"]

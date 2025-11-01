FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY tsconfig.json tsconfig.build.json ./
COPY src ./src
COPY test ./test

EXPOSE 3000

CMD ["npm", "run", "start:dev"]

FROM node:20.19-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY src ./src
COPY tsconfig.json ./
COPY nest-cli.json ./
RUN rm -rf dist && npm run build
CMD ["node","dist/main"]

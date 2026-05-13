FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
# cache bust 2026-05-13
CMD ["node","dist/main"]

FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN rm -rf dist node_modules/.cache && npm run build
# rebuild v3 2026-05-14
CMD ["node","dist/main"]

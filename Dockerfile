FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --frozen-lockfile
# rebuild-2026-06-27-v3
COPY . .
RUN rm -rf dist && npm run build
CMD ["node","dist/main"]

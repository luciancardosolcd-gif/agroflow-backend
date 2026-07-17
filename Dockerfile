FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --frozen-lockfile
# force-rebuild-2026-07-17
COPY . .
RUN rm -rf dist && npm run build
CMD ["node","dist/main"]

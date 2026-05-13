FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN rm -rf dist && npm run build
# force rebuild 2026-05-13-v2
CMD ["node","dist/main"]

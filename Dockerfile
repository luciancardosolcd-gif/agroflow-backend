FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --frozen-lockfile
# rebuild-2026-07-16-v1
COPY . .
RUN rm -rf dist && npm run build
CMD ["node","dist/main"]
   

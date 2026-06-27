FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --frozen-lockfile
ARG CACHEBUST=2
COPY . .
RUN rm -rf dist && npm run build
CMD ["node","dist/main"]

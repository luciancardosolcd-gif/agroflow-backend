FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ARG CACHEBUST=1
RUN rm -rf dist && npm run build
CMD ["node","dist/main"]

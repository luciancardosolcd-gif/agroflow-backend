FROM node:20.19-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN rm -rf dist && npm run build
CMD ["node","dist/main"]

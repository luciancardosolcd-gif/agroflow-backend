FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
RUN ls -la dist/categorias || echo "PASTA CATEGORIAS NAO ENCONTRADA NO DIST"
CMD ["node","dist/main"]

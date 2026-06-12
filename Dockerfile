FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --frozen-lockfile
COPY . .
RUN echo "=== entity lines ===" && wc -l src/cotacoes-insumos/cotacao-insumos.entity.ts
RUN rm -rf dist && npm run build
CMD ["node","dist/main"]

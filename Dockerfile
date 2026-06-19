FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --frozen-lockfile
COPY . .
RUN rm -rf dist && npm run build
CMD ["sh", "-c", "sed -i 's/user\\.email/user\\.perfil/g' /app/dist/propriedades/propriedades.controller.js && node dist/main"]

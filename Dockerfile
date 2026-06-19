FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --frozen-lockfile
COPY . .
RUN rm -rf dist && npm run build
RUN sed -i 's/user\.email/user\.perfil/g' /app/dist/propriedades/propriedades.controller.js
CMD ["node","dist/main"]

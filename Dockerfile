FROM node:20-alpine

RUN mkdir -p /app
WORKDIR /app
COPY tsconfig.json package.json package-lock.json ./
RUN npm ci --noproxy registry.npmjs.org --maxsockets 1
COPY src ./src
RUN npm run build
EXPOSE 3030
CMD [ "npm", "start" ]

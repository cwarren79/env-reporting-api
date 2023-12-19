FROM node:20-alpine

RUN mkdir -p /app
WORKDIR /app
COPY package.json package-lock.json .babelrc ./
RUN npm ci --noproxy registry.npmjs.org --maxsockets 1
COPY src ./src
EXPOSE 3030
CMD [ "npm", "start" ]

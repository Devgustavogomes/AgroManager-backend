FROM node:25.5 AS test-stage

WORKDIR /usr/src/app

COPY package*.json .

RUN npm ci --include=dev

COPY . .

RUN npm run test



FROM node:25.5 AS build-stage

WORKDIR /usr/src/app

COPY package*.json .

RUN npm ci --omit=dev

COPY . .

RUN npm run build



FROM node:25.5

WORKDIR /usr/src/app

COPY --from=build-stage /usr/src/app/node_modules /usr/src/app/node_modules

COPY --from=build-stage /usr/src/app/dist /usr/src/app/dist

CMD [ "npm", "run", "start:prod" ]


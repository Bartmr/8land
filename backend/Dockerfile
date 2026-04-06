FROM node:16-alpine

RUN mkdir -p /usr/src/app && chown node:node /usr/src/app

USER node

COPY ./package-lock.json \
  ./package.json \
  /usr/src/app/
WORKDIR /usr/src/app
RUN npm ci

ENV NODE_ENV=production

COPY ./src/ /usr/src/app/src/

COPY ./.nvmrc \
  ./nest-cli.json \
  ./tsconfig.json \
  ./tsconfig.build.json \
  ./firebase-env-to-file.js \
  /usr/src/app/

ARG FIREBASE_JSON
ENV FIREBASE_JSON=${FIREBASE_JSON}

RUN node ./firebase-env-to-file.js

ENV GOOGLE_APPLICATION_CREDENTIALS=/usr/src/app/service-account-file.json

# RUN npm run build:smart-contracts
RUN npm run build

CMD ["npm", "run", "start:prod"]

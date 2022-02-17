FROM node:16-alpine

COPY ./libs/shared/src/ /usr/src/app/libs/shared/src/
COPY ./libs/smart-contracts/contracts/ /usr/src/app/libs/smart-contracts/contracts/
COPY ./src/ /usr/src/app/src/
COPY ./scripts/ /usr/src/app/scripts/
COPY ./type-declarations/ /usr/src/app/type-declarations/

COPY ./.nvmrc \
./nest-cli.json \
./ormconfig.js \
./package-lock.json \
./package.json \
./tsconfig.base.json \
./tsconfig.declaration-files.json \
./tsconfig.build.json \
./polyfill-types-mocha.js \
./firebase-env-to-file.js \
./hardhat.config.ts /usr/src/app/

WORKDIR /usr/src/app

RUN npm ci

ENV NODE_ENV=production
ENV TS_NODE_PROJECT=tsconfig.build.json

ARG FIREBASE_JSON
ENV FIREBASE_JSON=${FIREBASE_JSON}

RUN node ./firebase-env-to-file.js

ENV GOOGLE_APPLICATION_CREDENTIALS=/usr/src/app/service-account-file.json

RUN npm run build:smart-contracts
RUN npm run build:api

CMD npm run start:prod

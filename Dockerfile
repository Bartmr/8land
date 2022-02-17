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
./tsconfig.build.json /usr/src/app/

WORKDIR /usr/src/app

RUN npm ci

RUN node ./firebase-env-to-file.js

ENV NODE_ENV=production
ENV GOOGLE_APPLICATION_CREDENTIALS=/usr/src/app/service-account-file.json

RUN npm run build:smart-contracts
RUN npm run build:api

CMD npm run start:prod

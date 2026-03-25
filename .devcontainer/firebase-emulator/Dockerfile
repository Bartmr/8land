FROM node:24


RUN apt-get update && \
  apt-get install -y --no-install-recommends \
    default-jre

ENV NPM_CONFIG_PREFIX=/root/.npm-global
ENV PATH="${PATH}:/root/.npm-global/bin"

COPY .firebaserc \
  firebase.json \
  /root/

RUN npm install -g firebase-tools

WORKDIR /root

CMD ["firebase", "emulators:start", "--export-on-exit=./.firebase-data", "--import=./.firebase-data"]

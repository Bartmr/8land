FROM node:18

ENV NPM_CONFIG_PREFIX=/root/.npm-global
ENV PATH="${PATH}:/root/.npm-global/bin"

RUN apt-get update \
  && apt-get install -y \
    nano \
    build-essential

RUN curl -fsSL https://claude.ai/install.sh | bash
ENV PATH="/root/.local/bin:$PATH"

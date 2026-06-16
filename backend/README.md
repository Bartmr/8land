## Setup

Create `.env` file and set the following:

```
API_PORT=3000
JWT_SECRET=secret

LOG_DATABASES=true

LOG_DEBUG=true

LOG_REQUEST_CONTENTS_ON_ERROR=true

WEB_APP_ORIGIN=http://localhost:8000

DATABASE_HOST=localhost|postgres
DATABASE_PORT=5432
DATABASE_NAME=postgres
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres

USE_DEV_EMAIL=true

START_LANDS_TOTAL_LIMIT=5
LAND_LIMIT_PER_WORLD=5
```

Run `npm install`

Seed development data

```bash
npm run build
node dist/development/seed/main.js
```

## Start

```
npm run start:dev
```

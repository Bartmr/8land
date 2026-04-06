require('dotenv').config()

require('source-map-support/register');


const {
  AppDataSource,
} = require(`./dist/backend/src/databases/data-source`);

module.exports = DATA_SOURCE

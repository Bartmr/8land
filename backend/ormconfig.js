if (process.env.NODE_ENV === 'production') {
  require('source-map-support/register');

  require('./dist/src/internals/environment/load-environment-variables');

  const {
    TYPEORM_ORMCONFIG,
  } = require(`./dist/src/internals/databases/typeorm-ormconfig`);

  module.exports = [
    {
      ...TYPEORM_ORMCONFIG,
    },
  ];
} else if (process.env.NODE_ENV === 'development') {
  require('./src/internals/environment/load-environment-variables');

  const {
    TYPEORM_ORMCONFIG,
  } = require(`./src/internals/databases/typeorm-ormconfig`);

  module.exports = [
    {
      ...TYPEORM_ORMCONFIG,
    },
  ];
} else {
  throw new Error(
    'typeorm-cli:unsupported-environment:' + process.env.NODE_ENV,
  );
}

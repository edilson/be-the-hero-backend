const knex = require('knex');
const configuration = require('../../knexfile');

// const config = process.env.NODE_ENV === 'test' ? configuration.test : configuration.development;

let config;

if(process.env.NODE_ENV === 'test') {
  config = configuration.test;
} else if(process.env.NODE_ENV === 'production') {
  config = configuration.production;
} else {
  config = configuration.development;
}

const connection = knex(config);

module.exports = connection;

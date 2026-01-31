const supertest = require('supertest');

function request() {
  // `global.__APP__` is the Express server started in jest.setup.js
  return supertest(global.__APP__);
}

module.exports = { request };

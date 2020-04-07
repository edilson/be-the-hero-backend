const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = require('chai').expect;
const crypto = require('crypto');

const connection = require('../src/database/connection');
const server = require('../server');
const generateUniqueId = require('../src/utils/generateUniqueId');

chai.use(chaiHttp);

describe('Session', () => {
  beforeEach(async () => {
    await connection.migrate.latest();
    const id = generateUniqueId();

    let ong = {
      name: 'ong-test',
      email: 'test@test.com',
      whatsapp: '81999340981',
      city: 'Recife',
      uf: 'PE',
    };

    let { name, email, whatsapp, city, uf } = ong;

    await connection('ong').insert({
      id,
      name,
      email,
      whatsapp,
      city,
      uf,
    });
  });

  describe('Create session', () => {
    it('Testing session creation', (done) => {
      chai
        .request('http://localhost:3333')
        .get('/ongs')
        .end((request, response) => {
          chai
            .request('http://localhost:3333')
            .post('/sessions')
            .send({ id: response.body[0].id })
            .end((request, response) => {
              expect(response.status).to.equal(200);
              expect(response.body).have.property('name');
              done();
            });
        });
    });

    it('Testing session creation without providing the ID', (done) => {
      chai
        .request('http://localhost:3333')
        .post('/sessions')
        .send({ id: '' })
        .end((request, response) => {
          expect(response.status).to.equal(400);
          expect(response.body.error).to.equal(
            'No ONG found with the provided ID.'
          );
          done();
        });
    });
  });
});

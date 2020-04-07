const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = require('chai').expect;
const crypto = require('crypto');

const connection = require('../src/database/connection');
const server = require('../server');
const generateUniqueId = require('../src/utils/generateUniqueId');

chai.use(chaiHttp);

describe('Profile', () => {
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

    let incident = {
      title: 'test-title',
      description: 'some description',
      value: 120,
      ong_id: id,
    };

    let { title, description, value, ong_id } = incident;

    await connection('incident').insert({
      title,
      description,
      value,
      ong_id,
    });
  });

  afterEach(async () => {
    await connection.migrate.rollback();
  });

  describe('List profile', () => {
    it('Testing list profile', (done) => {
      let retrievedOngId;

      chai
        .request('http://localhost:3333')
        .get('/ongs')
        .end((request, response) => {
          retrievedOngId = response.body[0].id;
          chai
            .request('http://localhost:3333')
            .get('/profile')
            .set('Authorization', retrievedOngId)
            .end((request, response) => {
              expect(response.status).to.equal(200);
              expect(response.body).to.be.a('array');
              expect(response.body[0].ong_id).to.equal(retrievedOngId);
              done();
            });
        });
    });
  });
});

const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = require('chai').expect;

const connection = require('../src/database/connection');
const server = require('../server');
const generateUniqueId = require('../src/utils/generateUniqueId');

chai.use(chaiHttp);

describe('ONGs', () => {
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

  afterEach(async () => {
    await connection.migrate.rollback();
  });

  describe('List ONGs', () => {
    it('Testing ONGs list', (done) => {
      chai
        .request('http://localhost:3333')
        .get('/ongs')
        .set('Accept', 'application/json')
        .end((request, response) => {
          expect(response.status).to.equal(200);
          expect(response.body).to.be.a('array');
          done();
        });
    });
  });

  describe('Create ONG', () => {
    it('Testing create ONG', (done) => {
      let ong_post = {
        name: 'ong-test-2',
        email: 'test2@test.com',
        whatsapp: '83998305981',
        city: 'João Pessoa',
        uf: 'PB',
      };

      chai
        .request('http://localhost:3333')
        .post('/ongs')
        .send(ong_post)
        .end((request, response) => {
          expect(response.status).to.equal(201);
          expect(response.body).to.be.a('object');
          expect(response.body).have.property('id');
          done();
        });
    });

    it('Test create ong with invalid data', (done) => {
      let ong_error = {
        name: 'ong-test-2',
        email: 'test2test.com',
        whatsapp: '839983059',
        city: 'João Pessoa',
        uf: 'PBE',
      };

      chai
        .request('http://localhost:3333')
        .post('/ongs')
        .send(ong_error)
        .end((request, response) => {
          expect(response.status).to.equal(400);
          done();
        });
    });
  });
});

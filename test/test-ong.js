const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = require('chai').expect;
const crypto = require('crypto');

const connection = require('../src/database/connection');
const server = require('../server');

chai.use(chaiHttp);

describe('ONGs', () => {
    const id = crypto.randomBytes(4).toString('HEX');

    beforeEach(() => {
        let ong = {
            name: "ong-test",
            email: "test@test.com",
            whatsapp: "81999340981",
            city: "Recife",
            uf: "PE"
        };

        let { name, email, whatsapp, city, uf } = ong;

        connection('ong').insert({
            id,
            name,
            email,
            whatsapp,
            city,
            uf
        });
    });

    after(() => {
        connection('ong').where('id', id).delete();
        console.log('Deleting test instances');
    })

    describe('List ONGs', () => {
        it('Testing ONGs list', (done) => {
            chai.request('http://localhost:3333')
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
                name: "ong-test-2",
                email: "test2@test.com",
                whatsapp: "83998305981",
                city: "João Pessoa",
                uf: "PB"
            };
    
            chai.request('http://localhost:3333')
                .post('/ongs')
                .send(ong_post)
                .end((request, response) => {
                    expect(response.status).to.equal(201);
                    expect(response.body).to.be.a('object');
                    expect(response.body).have.property('id');
                    done();
                });
        });
    });
});
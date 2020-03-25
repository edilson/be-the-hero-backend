const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = require('chai').expect;
const crypto = require('crypto');

const connection = require('../src/database/connection');
const server = require('../server');

chai.use(chaiHttp);

describe('Profile', () => {
    const id = crypto.randomBytes(4).toString('HEX');

    before(() => {
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

    beforeEach(() => {
        let incident = {
            title: "incident-test",
            description: "some description",
            value: 150.05
        };

        let { title, description, value } = incident;

        connection('incident').insert({
            title,
            description,
            value
        });
    });

    after(() => {
        connection('ong').where('id', id).delete();
        console.log('Deleting ong test instance');
        connection('incident').delete();
        console.log('Deleting incidents test instances');
    });

    describe('List profile', () => {
        it('Testing list profile', (done) => {
            chai.request('http://localhost:3333')
                .get('/ongs')
                .end((request, response) => {
                    chai.request('http://localhost:3333')
                        .get('/profile')
                        .set('Authorization', response.body[0].id)
                        .end((request, response) => {
                            expect(response.status).to.equal(200);
                            expect(response.body).to.be.a('array');
                            done();
                        });
                });
        });
    });
});
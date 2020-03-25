const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = require('chai').expect;
const crypto = require('crypto');

const connection = require('../src/database/connection');
const server = require('../server');

chai.use(chaiHttp);

describe('Incidents', () => {
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

    describe('List incidents', () => {
        it('Testing list incidents', (done) => {
            chai.request('http://localhost:3333')
            .get('/incidents')
            .end((request, response) => {
                expect(response.status).to.equal(200);
                expect(response.body).to.be.a('array');
                expect(response.body[0]).have.property('ong_id');
                expect(response.headers).have.property('x-total-count');
                done();
            });
        });
    });

    describe('Create incident', () => {
        let incident_post = {
            title: "incident-test",
            description: "some description",
            value: 150.05
        };

        it('Test incident creation', (done) => {
            chai.request('http://localhost:3333')
                .get('/ongs')
                .end((request, response) => {
                    chai.request('http://localhost:3333')
                        .post('/incidents')
                        .set('Authorization', response.body[0].id)
                        .send(incident_post)
                        .end((request, response) => {
                            expect(response.status).to.equal(201);
                            expect(response.body).have.property('id');
                            expect(response.body).to.be.a('object');
                            done();
                        });
                });
        });
    });

    describe('Delete incident', () => {
        it('Test delete incident', (done) => {
            let retrievedOngId;

            chai.request('http://localhost:3333')
                .get('/ongs')
                .end((request, response) => {
                    retrievedOngId = response.body[0].id;
                    chai.request('http://localhost:3333')
                        .get('/incidents')
                        .end((request, response) => {
                            chai.request('http://localhost:3333')
                                .delete(`/incidents/${response.body[0].id}`)
                                .set('Authorization', retrievedOngId)
                                .end((request, response) => {
                                    expect(response.status).to.equal(204);
                                    done();
                                });
                        });
                });
        });

        it('Test delete incident without setting authorization header', (done) => {
            chai.request('http://localhost:3333')
                .get('/incidents')
                .end((request, response) => {
                    chai.request('http://localhost:3333')
                        .delete(`/incidents/${response.body[1].id}`)
                        .end((request, response) => {
                            expect(response.status).to.equal(401);
                            expect(response.body.error).to.equal('Unallowed operation');
                            done();
                        });
                });
        });
    });
});
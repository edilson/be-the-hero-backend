const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = require('chai').expect;
const crypto = require('crypto');

const connection = require('../src/database/connection');
const server = require('../server');

chai.use(chaiHttp);

describe('Incidents', () => {
    const id = crypto.randomBytes(4).toString('HEX');

    beforeEach(async () => {
        await connection.migrate.latest();

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

    afterEach(async () => {
        await connection('ong').where('id', id).delete();
        console.log('Deleting ong test instance');
        await connection('incident').where('ong_id', id).delete();
        console.log('Deleting incidents test instances');
    });

    let incident_post = {
        title: "incident-test",
        description: "some description",
        value: 150.05
    };

    describe('List incidents', () => {
        it('Testing list incidents', (done) => {
            chai.request('http://localhost:3333')
                .get('/ongs')
                .end((request, response) => {
                    chai.request('http://localhost:3333')
                        .post('/incidents')
                        .set('Authorization', response.body[0].id)
                        .send(incident_post)
                        .end((request, response) => {
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
        });

        it('Test page query params must be a number', (done) => {
            chai.request('http://localhost:3333')
                .get('/incidents?page=a')
                .end((request, response) => {
                    expect(response.status).to.equal(400);
                    expect(response.body.message).to.equal("\"page\" must be a number");
                    done();
                });
        });
    });

    describe('Create incident', () => {
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

        it('Test creating incident with invalid data', (done) => {
            let incident_error = {
                "title": "it",
                "description": "some desc",
                "value": "ab"
            }

            chai.request('http://localhost:3333')
                .post('/incidents')
                .send(incident_error)
                .end((request, response) => {
                    expect(response.status).to.equal(400);
                    done();
                });
        });

        it('Test creating incident with no id provided', (done) => {
            chai.request('http://localhost:3333')
                .post('/incidents')
                .send(incident_post)
                .end((request, response) => {
                    expect(response.status).to.equal(400);
                    expect(response.body.message).to.equal("\"authorization\" is required");
                    done();
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
                        .delete(`/incidents/${response.body[0].id}`)
                        .end((request, response) => {
                            expect(response.status).to.equal(401);
                            expect(response.body.error).to.equal('Unallowed operation');
                            done();
                        });
                });
        });
    });
});
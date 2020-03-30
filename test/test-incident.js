const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = require('chai').expect;

const connection = require('../src/database/connection');
const server = require('../server');
const generateUniqueId = require('../src/utils/generateUniqueId');

chai.use(chaiHttp);

describe('Incidents', () => {
    beforeEach(async () => {
        await connection.migrate.latest();
        const id = generateUniqueId();

        let ong = {
            name: "ong-test-3",
            email: "test@test3.com",
            whatsapp: "81999320981",
            city: "João Pessoa",
            uf: "PB"
        };

        let { name, email, whatsapp, city, uf } = ong;

        await connection('ong').insert({
            id,
            name,
            email,
            whatsapp,
            city,
            uf
        });

        let incident = {
            title: "test-title",
            description: "some description",
            value: 120,
            ong_id: id
        }

        let { title, description, value, ong_id } = incident;

        await connection('incident').insert({
            title,
            description,
            value,
            ong_id
        });
    });

    afterEach(async () => {
        await connection.migrate.rollback();
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
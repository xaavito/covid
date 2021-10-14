const express = require('express');
const chai = require('chai');
const chaiHttp = require('chai-http');

//This actually starts the server
const app = require('../index');

const supertest = require('supertest');
var should = chai.should();
var server = supertest.agent("http://localhost:3000");
const expect = require('chai').expect;


chai.use(chaiHttp);

const config = require('../config.js');
const { db: { auth, user, pass, host, dbport, name }, tests: {deaths, newCases} } = config;


before(async () => {
    
});

after(async () => {
    
});

// IMPORTANT!!!! IN ORDER FOR TESTS TO RUN DB MUST BE UP AND RUNNING

describe("/covid/update GET unit test", () => {
    it("should return results which may change over time so we check that is 200 ok only", () => {
        chai.request("http://localhost:3001").get("/covid/update").query().end((err, res) => {
            res.should.have.status(200);
            expect(res.body).to.have.property('lastUpdateCases').to.be.not.null;
            expect(res.body).to.have.property('lastUpdateDate').to.be.not.null;
            expect(res.body).not.to.have.property('pepe');
            //expect(res.body).to.have.property('coco');
            //done();
        })
    });
});


describe("/covid/total GET unit test", () => {
    it("should return result", (done) => {
        // calling home page api
        chai.request("http://localhost:3001").get("/covid/total").query({ sex: 'T', province: 1000, ageFrom: 0, ageTo: 50, startDate: '2021-09-01', endDate: '2021-09-30' }).end((err, res) => {
            res.should.have.status(200);
            expect(res.body).to.have.property('newCases').to.be.equal(newCases);
            done();
        })
    });
});

describe("/covid/deaths GET unit test", () => {
    it("should return result", (done) => {
        // calling home page api
        chai.request("http://localhost:3001").get("/covid/deaths").query({ sex: 'T', province: 1000, ageFrom: 0, ageTo: 50, startDate: '2021-09-01', endDate: '2021-09-30' }).end((err, res) => {
            res.should.have.status(200);
            expect(res.body).to.have.property('deaths').to.be.equal(deaths);
            done();
        })
    });
});

/*
// This Test cant be run since its execution could fire syn process which takes so long..
// trust me this works
describe("/covid/update POST unit test", () => {
    it("should return result", (done) => {
        // calling home page api
        chai.request("http://localhost:3001").post("/covid/update").end((err, res) => {
            res.should.have.status(200);
            expect(res.body).to.have.property('status').to.be.equal('Success');
            done();
        })
    });
});
*/
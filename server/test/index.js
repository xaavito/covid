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

describe("/covid/update GET unit test", () => {
    it("should return result", (done) => {
        // calling home page api
        chai.request("http://localhost:3001").get("/covid/update").end((err, res) => {
            res.should.have.status(200);
            expect(res.body).to.have.property('lastUpdateCases').to.be.equal('2000');
            done();
        })
    });
});

describe("/covid/total GET unit test", () => {
    it("should return result", (done) => {
        // calling home page api
        chai.request("http://localhost:3001").get("/covid/total").end((err, res) => {
            res.should.have.status(200);
            expect(res.body).to.have.property('newCases').to.be.equal('200');
            done();
        })
    });
});

describe("/covid/deaths GET unit test", () => {
    it("should return result", (done) => {
        // calling home page api
        chai.request("http://localhost:3001").get("/covid/deaths").end((err, res) => {
            res.should.have.status(200);
            expect(res.body).to.have.property('covidDeaths').to.be.equal('50');
            done();
        })
    });
});

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
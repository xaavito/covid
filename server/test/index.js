const express = require('express');
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../index');
const supertest = require('supertest');
var should = chai.should();
var server = supertest.agent("http://localhost:3000");

//const app = express();

chai.use(chaiHttp);

describe("SAMPLE unit test", () => {
    describe("SAMPLE unit test", () => {
        // #1 should return home page

        it("should return home page", (done) => {

            // calling home page api
            chai.request("http://localhost:3001").get("/covid/update").end((err, res) => {
                res.should.have.status(200);
                done();
            })
        });
    });

});
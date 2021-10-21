const path = require('path');
const express = require("express");
const pino = require('express-pino-logger')();
var cors = require('cors')
const swaggerUi = require('swagger-ui-express');
const openApiDocumentation = require('../swagger/swagger.json');

// Import required module csvtojson and mongodb packages
const mongodb = require('mongodb');
// **************************************
const config = require('./config.js');

const { app: { port } } = config;

const { db: { dbURL } } = config;

const PORT = port || 3001;
// **************************************
const { Worker } = require("worker_threads");
const { rejects } = require('assert');

const app = express();
// Have Node serve the files for our built React app
app.use(express.static(path.resolve(__dirname, '../client/build')));

// Avoid localhost connection
app.use(cors());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiDocumentation));
// PINO LOGGER
//app.use(pino);

// GET Method that returns new Cases
app.get("/covid/total", async (req, res) => {
  try {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');

    const params = req.query;

    let dbConn;
    let connection;

    mongodb.MongoClient.connect(dbURL, {
      useUnifiedTopology: true, ignoreUndefined: true
    })
      .then((client) => {
        connection = client;
        dbConn = client.db("covid");

        return dbConn.collection('casos_1').count({
          'edad': {
            $gte: Number(params.ageFrom),
            $lt: Number(params.ageTo)
          },
          'sexo': params.sex === 'T' ? undefined : params.sex,
          'fecha_diagnostico': {
            $gte: params.startDate,
            $lt: params.endDate
          },
          'residencia_provincia_id': Number(params.province) === 1000 ? undefined : Number(params.province),
          'clasificacion_resumen': 'Confirmado',
          'fecha_fallecimiento': ''
        });
      })
      .then((results) => {
        console.log("Cases " + results)
        connection.close();
        res.status(200).send({ newCases: results });
      })
      .catch(err => {
        console.error(err.message);
        connection.close();
        res.status(504).send({ message: err.message });
      });
  } catch (err) {
    console.error(err);
    res.status(504).send({ message: err });
  }
});

// GET Method that returns new Deaths
app.get("/covid/deaths", async (req, res) => {
  try {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    const params = req.query;

    let dbConn;
    let connection

    mongodb.MongoClient.connect(dbURL, {
      useUnifiedTopology: true, ignoreUndefined: true
    })
      .then((client) => {
        connection = client;
        dbConn = client.db("covid");

        return dbConn.collection('casos_1').count({
          'edad': {
            $gte: Number(params.ageFrom),
            $lt: Number(params.ageTo)
          },
          'sexo': params.sex === 'T' ? undefined : params.sex,
          'fecha_fallecimiento': {
            $gte: params.startDate,
            $lt: params.endDate
          },
          'residencia_provincia_id': Number(params.province) === 1000 ? undefined : Number(params.province),
          'clasificacion_resumen': 'Confirmado'
        });
      })
      .then((results) => {
        console.log("Deaths " + results)
        connection.close();
        res.status(200).send({ deaths: results });
      })
      .catch(err => {
        console.error(err.message);
        res.status(504).send({ message: err.message });
      });
  } catch (err) {
    console.error(err);
    res.status(504).send({ message: err });
  }
});

// GET Method that returns last imported added registries
app.get("/covid/update", async (req, res) => {
  try {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');

    let dbConn;

    let connection

    let myobj;
    let lastUpdateDate;
    let lastRecordNumber;
    let lastUpdateCases;

    mongodb.MongoClient.connect(dbURL, {
      useUnifiedTopology: true,
    })
      .then((client) => {
        connection = client;
        dbConn = client.db("covid");

        // We search for the collection that holds last updated data
        return dbConn.collection('misc').find({}).toArray();
      })
      .then((results) => {
        // If Theres is information we use it.
        if (results.length === 1) {
          lastUpdateCases = results[0].lastUpdateCases;
          lastUpdateDate = results[0].lastUpdateDate;

          myobj = { lastUpdateCases: lastUpdateCases, lastUpdateDate: lastUpdateDate }
          // HACK, CANT BREAK PROMISE CHAIN SO WE WE BREAKE IT WITH AN ERROR
          throw new Error('INFORMATION');
        }
        //if there is no information we gather it.
        if (results.length === 0) {
          //Search for the last event by Id_event
          return dbConn.collection('casos_1')
            .find()
            .sort({ "id_evento_caso": -1 })
            .limit(1).toArray();
        }
      })
      .then((results) => {
        if (results.length === 1) {
          // WE GET THE LAST UPDATE DATE AND LAST EVENT CASE NR.
          lastUpdateDate = results[0].ultima_actualizacion;
          lastRecordNumber = results[0].id_evento_caso;

          // WE GET LATEST MISC DATA
          return dbConn.collection('casos_1')
            .count({});
        }
      })
      .then((results) => {
        lastUpdateCases = results

        myobj = { lastUpdateCases: lastUpdateCases, lastUpdateDate: lastUpdateDate, lastRecordNumber: lastRecordNumber }
        //WITH ALL THE NEW DATA WE INSERT IT AS A NEW REGISTRY, THIS TIPUCALLY HAPPENS ON FIRTS IMPORT
        return dbConn.collection('misc').insertOne(myobj);
      })
      .then((results) => {
        // WE SEND OBJ, RESULTS DONT CARE NOW.
        connection.close();
        res.status(200).send(myobj);
      }).catch((err) => {
        //connection.close()
        // hack brake promise chain
        if (err.message === 'INFORMATION') {
          //console.error("HACKKKKK");
          res.status(200).send(myobj);
        }
        else {
          // ACTUAL ERROR
          console.error(err);
          res.status(504).send({ message: err });
        }
      });
  } catch (err) {
    console.log("a verrrrr");
    console.error(err);
    res.status(504).send({ message: err });
  }
});

// POST Method that fires the CSV LOAD
app.post("/covid/update", async (req, res) => {
  try {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    //console.log("covid/update");
    const worker = new Worker("./server/workers/asyncDataLoad.js");

    worker.on("message", result => {
      //console.log("Backend " + JSON.stringify(result))

      if (result.status === 200) {
        //console.log("200")
        res.status(result.status).send({ lastUpdateCases: result.lastUpdateCases, lastUpdateDate: result.lastUpdateDate });
      }
      if (result.status === 201) {
        //console.log("201")
        res.status(result.status).send({});
      }
      if (result.status === 504) {
        //console.log("504")
        res.status(result.status).send({ message: result.errorMessage });
      }
    });

    worker.on("error", error => {
      console.error(error);
    });

    worker.on("exit", exitCode => {
      //console.log(exitCode);
    })

    worker.postMessage("ndada");

  } catch (err) {
    console.error(err);
    res.status(504).send({ message: err });
  }
});

// All other GET requests not handled before will return our React app
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});


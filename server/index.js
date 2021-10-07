const path = require('path');
const express = require("express");
const pino = require('express-pino-logger')();
var cors = require('cors')

// Import required module csvtojson and mongodb packages
const mongodb = require('mongodb');

const PORT = process.env.PORT || 3001;

const { Worker } = require("worker_threads");

const app = express();
// Have Node serve the files for our built React app
app.use(express.static(path.resolve(__dirname, '../client/build')));

// Avoid localhost connection
app.use(cors());
// PINO LOGGER
//app.use(pino);

//DB Connection String
const dbURL = 'mongodb://covid:covid@localhost:27017/covid';

// Handle GET requests to /api route
app.get("/api", (req, res) => {
  res.json({ message: "Hello from server!" });
});

// GET Method that returns new Cases
app.get("/covid/total", async (req, res) => {
  try {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');

    const params = req.query;

    let dbConn;

    mongodb.MongoClient.connect(dbURL, {
      useUnifiedTopology: true, ignoreUndefined: true
    }).then((client) => {
      dbConn = client.db("covid");

      dbConn.collection('casos_1').count({
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
      }, function (err, results) {
        console.log("Cases " + results)
        res.status(200).send({ newCases: results });
      });
    }).catch(err => {
      console.error(`DB Connection Error: ${err.message}`);
      res.status(504).send({ message: `DB Connection Error: ${err.message}` });
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

    mongodb.MongoClient.connect(dbURL, {
      useUnifiedTopology: true, ignoreUndefined: true
    }).then((client) => {
      dbConn = client.db("covid");

      dbConn.collection('casos_1').count({
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
      }, function (err, results) {
        console.log("Deaths " + results)
        res.status(200).send({ deaths: results });
      });
    }).catch(err => {
      console.error(`DB Connection Error: ${err.message}`);
      res.status(504).send({ message: `DB Connection Error: ${err.message}` });
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

    mongodb.MongoClient.connect(dbURL, {
      useUnifiedTopology: true,
    }).then(async (client) => {
      dbConn = client.db("covid");

      // We search for the collection that holds last updated data
      dbConn.collection('misc').find({}).toArray((err, results) => {
        if (err) throw err;
        // If Theres is information we use it.
        if (results.length === 1) {
          lastUpdateCases = results[0].lastUpdateCases;
          lastUpdateDate = results[0].lastUpdateDate;

          res.status(200).send({ lastUpdateCases: lastUpdateCases, lastUpdateDate: lastUpdateDate });
        }

        //if there is no information we gather it.
        if (results.length === 0) {
          //Search for the last event by Id_event
          const cursor = dbConn.collection('casos_1')
            .find()
            .sort({ "id_evento_caso": -1 })
            .limit(1).toArray((err, results) => {
              if (err) throw err;
              var myobj;
              if (results.length === 1) {
                lastUpdateDate = results[0].ultima_actualizacion;
                lastRecordNumber = results[0].id_evento_caso;

                // Since there was no information we count total results (that since there is no information is the first import)
                const cursor = dbConn.collection('casos_1')
                  .count({}, function (err, results) {
                    if (err) throw err;
                    lastUpdateCases = results

                    myobj = { lastUpdateCases: lastUpdateCases, lastUpdateDate: lastUpdateDate, lastRecordNumber: lastRecordNumber }

                    //Insert into misc the information about last updated date, records and id_event
                    dbConn.collection('misc').insertOne(myobj, function (err, res) {
                      if (err) throw err;
                      client.close();
                    });
                    res.status(200).send({ lastUpdateCases: lastUpdateCases, lastUpdateDate: lastUpdateDate });
                  });
              }
            });
        }
      });
    }).catch(err => {
      console.error(`DB Connection Error: ${err.message}`);
      res.status(504).send({ message: `DB Connection Error: ${err.message}` });
    });
  } catch (err) {
    console.error(err);
    res.status(504).send({ message: err });
  }
});

// POST Method that fires the CSV LOAD
app.post("/covid/update", async (req, res) => {
  try {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    console.log("covid/update");
    const worker = new Worker("./server/workers/asyncDataLoad.js");

    worker.on("message", result => {
      console.log("Backend " + JSON.stringify(result))

      if (result.status === 200) {
        console.log("200")
        res.status(result.status).send({ lastUpdateCases: result.lastUpdateCases, lastUpdateDate: result.lastUpdateDate });
      }
      if (result.status === 201) {
        console.log("201")
        res.status(result.status).send({});
      }
      if (result.status === 504) {
        console.log("504")
        res.status(result.status).send({ message: result.errorMessage });
      }
    });

    worker.on("error", error => {
      console.log(error);
    });

    worker.on("exit", exitCode => {
      console.log(exitCode);
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


const path = require('path');
const express = require("express");
const bodyParser = require('body-parser');
const pino = require('express-pino-logger')();
var cors = require('cors')

const http = require('https');
//var unzip = require('unzip');

// Import required module csvtojson and mongodb packages
//const csvtojson = require('csvtojson');
const mongodb = require('mongodb');

const PORT = process.env.PORT || 3001;

const app = express();
// Have Node serve the files for our built React app
app.use(express.static(path.resolve(__dirname, '../client/build')));

// PARA EVITAR EL TEMA DE LA RESTRICCION DE DONDE LE PEGAN MUCHO BARDO CON LOCALHOST
app.use(cors());
// PINO LOGGER
app.use(pino);

// PARSEO MAGICO DE JSON DEL BODY
//app.use(bodyParser.json()); // support json encoded bodies
//app.use(bodyParser.urlencoded({ extended: false })); // support encoded bodies

//DB Connection String
const dbURL = 'mongodb://covid:covid@localhost:27017/covid';
const collection = 'covid';

//test
const fs = require('fs');

const readline = require('readline');

//const csvFile = './Covid19Casos.csv';

const line_counter = ((i = 0) => () => ++i)();

var dbConn;

function isTimeToUpdate(lastUpdatedDate) {
  var parts = lastUpdatedDate.split('-');
  var mydate = new Date(parts[0], parts[1] - 1, parts[2]);
  const today = new Date();
  if (mydate < today) {
    //console.log(mydate.toDateString());
    //console.log(today.toDateString());
    return true;
  }
  return false;
}

async function processLineByLine() {
  const fileStream = fs.createReadStream('./Covid19Casos.csv');

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  // Note: we use the crlfDelay option to recognize all instances of CR LF
  // ('\r\n') in input.txt as a single line break.

  rl.on("line", (line, lineno = line_counter()) => {
    //if line.split(',')
    console.log(line); //1...2...3...10...100...etc
  });
  /*
  for await (const line of rl) {
    // Each line in input.txt will be successively available here as `line`.
    console.log(`Line from file: ${line}`);
    //count++;
  }
  */
  console.log(`Conteo final: ${count}`);
}

// Handle GET requests to /api route
app.get("/api", (req, res) => {
  res.json({ message: "Hello from server!" });
});

// GET Method that returns new Cases
// TODO: Faltan Params
app.get("/covid/total", async (req, res) => {
  try {
    console.log("GET /covid/total");
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');

    const startDate = req.query.startDate
    const endDate = req.query.endDate
    const ageFrom = req.query.ageFrom
    const ageTo = req.query.ageTo
    const sex = req.query.sex
    const province = req.query.province

    mongodb.MongoClient.connect(dbURL, {
      useUnifiedTopology: true,
    }).then((client) => {
      dbConn = client.db("covid");

      dbConn.collection('casos_1').count({
        'edad': {
          $gte: Number(ageFrom),
          $lt: Number(ageTo)
        },
        'sexo': sex,
        'fecha_diagnostico': {
          $gte: startDate,
          $lt: endDate
        },
        'residencia_provincia_id': Number(province),
        'clasificacion_resumen': 'Confirmado',
        'fecha_fallecimiento': ''
      }, function (err, results) {
        console.log(results); // output all records
        res.status(200).send({ newCases: results });
      });
    }).catch(err => {
      console.log(`DB Connection Error: ${err.message}`);
      res.status(504).send({ mensaje: err.message });
    });
  } catch (err) {
    console.error(err);
    res.status(504).send({ mensaje: err });
  }
});

// GET Method that returns new Deaths
// TODO: Faltan Params
app.get("/covid/deaths", async (req, res) => {
  try {
    console.log("GET /covid/deaths");
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    const startDate = req.query.startDate
    const endDate = req.query.endDate
    const ageFrom = req.query.ageFrom
    const ageTo = req.query.ageTo
    const sex = req.query.sex
    const province = req.query.province

    mongodb.MongoClient.connect(dbURL, {
      useUnifiedTopology: true,
    }).then((client) => {
      console.log('DB Connected!');
      dbConn = client.db("covid");

      dbConn.collection('casos_1').count({
        'edad': {
          $gte: Number(ageFrom),
          $lt: Number(ageTo)
        },
        'sexo': sex,
        'fecha_fallecimiento': {
          $gte: startDate,
          $lt: endDate
        },
        'residencia_provincia_id': Number(province),
        'clasificacion_resumen': 'Confirmado'
      }, function (err, results) {
        console.log(results); // output all records
        res.status(200).send({ covidDeaths: results });
      });
    }).catch(err => {
      console.log(`DB Connection Error: ${err.message}`);
      res.status(504).send({ mensaje: err.message });
    });
    //res.status(200).send({ covidDeaths: '50' });
  } catch (err) {
    console.error(err);
    res.status(504).send({ mensaje: err });
  }
});

// GET Method that returns last imported added registries
// TODO: Faltan Params
app.get("/covid/update", async (req, res) => {
  try {
    console.log("GET /covid/deaths");
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');

    mongodb.MongoClient.connect(dbURL, {
      useUnifiedTopology: true,
    }).then(async (client) => {
      console.log('DB Connected!');
      dbConn = client.db("covid");
      /*
      dbConn.collection("casos_1").find({
        edad: {
          $gte: 50, //`${startDate}`,
          $lt: 52//`${endDate}`
        }
      }).toArray(function (err, result) {
        if (err) throw err;
        //res.send(JSON.stringify(result));
        console.log(JSON.stringify(result))
      });
      */
      dbConn.collection('misc').find({}).toArray((err, results) => {
        //const results = cursor.toArray();
        console.log("adentroooo")
        // If Theres is information we use it.
        if (results.length === 1) {
          console.log("hay un caso en misc")
          lastUpdateCases = results[0].lastUpdateCases;
          lastUpdateDate = results[0].lastUpdateDate;

          res.status(200).send({ lastUpdateCases: lastUpdateCases, lastUpdateDate: lastUpdateDate });
        }

        //if there is no information we gathered it.
        if (results.length === 0) {
          console.log("no hay un caso en misc, generamos")
          const cursor = dbConn.collection('casos_1')
            .find()
            .sort({ "id_evento_caso": -1 })
            .limit(1).toArray((err, results) => {
              var myobj;
              if (results.length === 1) {
                lastUpdateDate = results[0].ultima_actualizacion;
                console.log("lastUpdateDate " + lastUpdateDate)
                const cursor = dbConn.collection('casos_1')
                  .count({}, function (err, results) {
                    console.log(results); // output all records
                    lastUpdateCases = results

                    console.log("lastUpdateCases " + lastUpdateCases)

                    myobj = { lastUpdateCases: lastUpdateCases, lastUpdateDate: lastUpdateDate }

                    dbConn.collection('misc').insertOne(myobj, function (err, res) {
                      if (err) throw err;
                      console.log("1 record inserted");
                      client.close();
                    });
                    res.status(200).send({ lastUpdateCases: lastUpdateCases, lastUpdateDate: lastUpdateDate });
                  });
              }
            });
        }
      });
    }).catch(err => {
      console.log(`DB Connection Error: ${err.message}`);
    });

    //processLineByLine();
    //res.status(200).send({ lastUpdateCases: '2000', lastUpdateDate: new Date() });
  } catch (err) {
    console.error(err);
    res.status(504).send({ mensaje: err });
  }
});

// POST Method that fires the CSV LOAD
// TODO: Faltan Params
app.post("/covid/update", async (req, res) => {
  try {
    console.log("POST /covid/deaths");
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');

    // this works perfectly!!! commented for testing purposes
    /*
    const file = fs.createWriteStream("UpdatedData.zip");
  
    const request = http.get("https://sisa.msal.gov.ar/datos/descargas/covid-19/files/Covid19Casos.zip", function (response) {
      response.pipe(file);

      response.on('end', function () {
        console.log("Download Finished");
        // Aca deberia venir el deszipeo..
        
        res.status(200).send({ status: 'Success' });
      });
    });
    */
    mongodb.MongoClient.connect(dbURL, {
      useUnifiedTopology: true,
    }).then(async (client) => {
      //console.log('DB Connected!');
      dbConn = client.db("covid");
      /*
      dbConn.collection("casos_1").find({
        edad: {
          $gte: 50, //`${startDate}`,
          $lt: 52//`${endDate}`
        }
      }).toArray(function (err, result) {
        if (err) throw err;
        //res.send(JSON.stringify(result));
        console.log(JSON.stringify(result))
      });
      */
      /*
      var myobj = { name: "Ajeet Kumar", age: "28", address: "Delhi" };
      const cursor = dbConn.collection('casos_1')
        .find()
        .sort({ "id_evento_caso": -1 })
        .limit(1);
      
      const results = await cursor.toArray();
      if (results.length === 1) {
        const lastUpdateDate = results[0].ultima_actualizacion;
        setLast
        if (isTimeToUpdate(lastUpdateDate)) {

        }
        dbConn.collection('misc').insertOne(myobj, function (err, res) {
          if (err) throw err;
          console.log("1 record inserted");
          client.close();
        });
      }
      */
      //client.close();
    }).catch(err => {
      console.log(`DB Connection Error: ${err.message}`);
    });
    //res.status(200).send({ status: 'Success' });
  } catch (err) {
    console.error(err);
    res.status(504).send({ mensaje: err });
  }
});

// All other GET requests not handled before will return our React app
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});


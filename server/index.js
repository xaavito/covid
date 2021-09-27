const path = require('path');
const express = require("express");
//const bodyParser = require('body-parser');
const pino = require('express-pino-logger')();
var cors = require('cors')

const http = require('https');

// Import required module csvtojson and mongodb packages
//const csvtojson = require('csvtojson');
const mongodb = require('mongodb');

const fastcsv = require("fast-csv");

const PORT = process.env.PORT || 3001;

const app = express();
// Have Node serve the files for our built React app
app.use(express.static(path.resolve(__dirname, '../client/build')));

// PARA EVITAR EL TEMA DE LA RESTRICCION DE DONDE LE PEGAN MUCHO BARDO CON LOCALHOST
app.use(cors());
// PINO LOGGER
app.use(pino);

//DB Connection String
const dbURL = 'mongodb://covid:covid@localhost:27017/covid';

//test
const fs = require('fs');

const readline = require('readline');

//const csvFile = './Covid19Casos.csv';

var dbConn;

function isTimeToUpdate(lastUpdatedDate) {
  var parts = lastUpdatedDate.split('-');
  // uff This sucks, but needed to be done
  var mydate = new Date(new Date(parts[0], parts[1] - 1, parts[2]).toDateString());
  var today = new Date(new Date().toDateString());
  //today.setHours(0, 0, 0)

  console.log(today)
  console.log(mydate)

  if (mydate < today) {
    console.log("isTimeToUpdate true")
    return true;
  }
  console.log("isTimeToUpdate false")
  return false;
}

function todayParsed() {
  var mydate = new Date().toLocaleDateString('es-ar');
  var strSplitDate = String(mydate).split('/');
  var date = ""

  date = strSplitDate[2] + "-" + ('0' + strSplitDate[1]).slice(-2) + "-" + ('0' + strSplitDate[0]).slice(-2);
  console.log(date);
  return date;
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
      useUnifiedTopology: true, ignoreUndefined: true
    }).then((client) => {
      dbConn = client.db("covid");

      dbConn.collection('casos_1').count({
        'edad': {
          $gte: Number(ageFrom),
          $lt: Number(ageTo)
        },
        'sexo': sex === 'T' ? undefined : sex,
        'fecha_diagnostico': {
          $gte: startDate,
          $lt: endDate
        },
        'residencia_provincia_id': Number(province) === 1000 ? undefined : Number(province),
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

    console.log(req.query)
    console.log(req.query.sex)

    if (typeof ageFrom === 'undefined') {
      console.log("age undefined")
    }

    mongodb.MongoClient.connect(dbURL, {
      useUnifiedTopology: true, ignoreUndefined: true
    }).then((client) => {
      dbConn = client.db("covid");

      dbConn.collection('casos_1').count({
        'edad': {
          $gte: Number(ageFrom),
          $lt: Number(ageTo)
        },
        'sexo': sex === 'T' ? undefined : sex,
        'fecha_fallecimiento': {
          $gte: startDate,
          $lt: endDate
        },
        'residencia_provincia_id': Number(province) === 1000 ? undefined : Number(province),
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

      dbConn.collection('misc').find({}).toArray((err, results) => {
        if (err) throw err;
        //const results = cursor.toArray();
        //console.log("adentroooo")
        // If Theres is information we use it.
        if (results.length === 1) {
          //console.log("hay un caso en misc")
          lastUpdateCases = results[0].lastUpdateCases;
          lastUpdateDate = results[0].lastUpdateDate;

          res.status(200).send({ lastUpdateCases: lastUpdateCases, lastUpdateDate: lastUpdateDate });
        }

        //if there is no information we gather it.
        if (results.length === 0) {
          //console.log("no hay un caso en misc, generamos")
          const cursor = dbConn.collection('casos_1')
            .find()
            .sort({ "id_evento_caso": -1 })
            .limit(1).toArray((err, results) => {
              if (err) throw err;
              var myobj;
              if (results.length === 1) {
                lastUpdateDate = results[0].ultima_actualizacion;
                lastRecordNumber = results[0].id_evento_caso;
                //console.log("lastUpdateDate " + lastUpdateDate)
                const cursor = dbConn.collection('casos_1')
                  .count({}, function (err, results) {
                    //console.log(results); // output all records
                    if (err) throw err;
                    lastUpdateCases = results

                    //console.log("lastUpdateCases " + lastUpdateCases)

                    myobj = { lastUpdateCases: lastUpdateCases, lastUpdateDate: lastUpdateDate, lastRecordNumber: lastRecordNumber }

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
    /*
     mongodb.MongoClient.connect(dbURL, {
       useUnifiedTopology: true,
     }).then(async (client) => {
       dbConn = client.db("covid");
 
     }).catch(err => {
       console.log(`DB Connection Error: ${err.message}`);
     });
     */


    mongodb.MongoClient.connect(dbURL, {
      useUnifiedTopology: true,
    }).then((client) => {
      dbConn = client.db("covid");

      dbConn.collection('misc').find({}).toArray((err, results) => {
        if (err) throw err;
        //const results = cursor.toArray();
        console.log("adentroooo")
        // If Theres is information we use it.
        if (results.length === 1) {

          if (isTimeToUpdate(results[0].lastUpdateDate)) {
            console.log("time to update!!!!")
            //console.log("hay un caso en misc " + results[0])

            //res.status(200).send({ lastUpdateCases: lastUpdateCases, lastUpdateDate: lastUpdateDate });
            let stream = fs.createReadStream("Covid19Casos.csv");
            let csvData = [];
            let csvStream = fastcsv
              .parse()
              .on("data", function (data) {

                if (data[20] === "Confirmado" && Number(data[0]) > Number(results[0].lastRecordNumber)) {
                  csvData.push({
                    id_evento_caso: data[0],
                    sexo: data[1],
                    edad: data[2],
                    edad_años_meses: data[3],
                    residencia_pais_nombre: data[4],
                    residencia_provincia_nombre: data[5],
                    residencia_departamento_nombre: data[6],
                    carga_provincia_nombre: data[7],
                    fecha_inicio_sintomas: data[8],
                    fecha_apertura: data[9],
                    sepi_apertura: data[10],
                    fecha_internacion: data[11],
                    cuidado_intensivo: data[12],
                    fecha_cui_intensivo: data[13],
                    fallecido: data[14],
                    fecha_fallecimiento: data[15],
                    asistencia_respiratoria_mecanica: data[16],
                    carga_provincia_id: data[17],
                    origen_financiamiento: data[18],
                    clasificacion: data[19],
                    clasificacion_resumen: data[20],
                    residencia_provincia_id: data[21],
                    fecha_diagnostico: data[22],
                    residencia_departamento_id: data[23],
                    ultima_actualizacion: data[24]
                  });
                }
              })
              .on("end", function () {
                // remove the first line: header
                csvData.shift();

                console.log(csvData);

                mongodb.MongoClient.connect(
                  dbURL,
                  { useNewUrlParser: true, useUnifiedTopology: true },
                  (err, client) => {
                    if (err) throw err;

                    client
                      .db("covid")
                      .collection("casos_1")
                      .insertMany(csvData, (err, response) => {
                        if (err) throw err;

                        console.log(`Inserted: ${response.insertedCount} rows`);

                        dbConn.collection('casos_1')
                          .find()
                          .sort({ "id_evento_caso": -1 })
                          .limit(1).toArray((err, results) => {
                            if (err) throw err;
                            var myobj;
                            if (results.length === 1) {
                              //lastUpdateDate = results[0].ultima_actualizacion;
                              lastRecordNumber = results[0].id_evento_caso;

                              dbConn.collection('misc').deleteMany({}, function (err, res) {
                                if (err) throw err;
                              });

                              myobj = { lastUpdateCases: response.insertedCount, lastUpdateDate: todayParsed(), lastRecordNumber: lastRecordNumber }

                              dbConn.collection('misc').insertOne(myobj, function (err, res) {
                                if (err) throw err;
                                client.close();
                              });
                              res.status(200).send({ lastUpdateCases: response.insertedCount, lastUpdateDate: todayParsed() });
                            }
                          });
                        //client.close();
                        //res.status(200).send({ status: 'Success' });
                      });
                  }
                );
              });

            stream.pipe(csvStream);
          }
          else {
            console.log("well... its no time to update!!!!")
          }
        }
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

// All other GET requests not handled before will return our React app
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});


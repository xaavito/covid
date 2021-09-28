const path = require('path');
const express = require("express");
const pino = require('express-pino-logger')();
var cors = require('cors')

const http = require('https');

// Import required module csvtojson and mongodb packages
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

// Unzipper
const extract = require('extract-zip')

var dbConn;

// function to determine if it ok to update
function isTimeToUpdate(lastUpdatedDate) {
  var parts = lastUpdatedDate.split('-');
  // uff This sucks, but needed to be done
  var mydate = new Date(new Date(parts[0], parts[1] - 1, parts[2]).toDateString());
  var today = new Date(new Date().toDateString());

  if (mydate < today) {
    return true;
  }
  return false;
}

// Parse date to match DB dates.
function todayParsed() {
  var mydate = new Date().toLocaleDateString('es-ar');
  var strSplitDate = String(mydate).split('/');
  var date = ""

  date = strSplitDate[2] + "-" + ('0' + strSplitDate[1]).slice(-2) + "-" + ('0' + strSplitDate[0]).slice(-2);
  return date;
}

// Handle GET requests to /api route
app.get("/api", (req, res) => {
  res.json({ message: "Hello from server!" });
});

// GET Method that returns new Cases
app.get("/covid/total", async (req, res) => {
  try {
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
        res.status(200).send({ newCases: results });
      });
    }).catch(err => {
      console.error(`DB Connection Error: ${err.message}`);
      res.status(504).send({ mensaje: `DB Connection Error: ${err.message}` });
    });
  } catch (err) {
    console.error(err);
    res.status(504).send({ mensaje: err });
  }
});

// GET Method that returns new Deaths
app.get("/covid/deaths", async (req, res) => {
  try {
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
        'fecha_fallecimiento': {
          $gte: startDate,
          $lt: endDate
        },
        'residencia_provincia_id': Number(province) === 1000 ? undefined : Number(province),
        'clasificacion_resumen': 'Confirmado'
      }, function (err, results) {
        res.status(200).send({ covidDeaths: results });
      });
    }).catch(err => {
      console.error(`DB Connection Error: ${err.message}`);
      res.status(504).send({ mensaje: `DB Connection Error: ${err.message}` });
    });
  } catch (err) {
    console.error(err);
    res.status(504).send({ mensaje: err });
  }
});

// GET Method that returns last imported added registries
app.get("/covid/update", async (req, res) => {
  try {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');

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
      res.status(504).send({ mensaje: `DB Connection Error: ${err.message}` });
    });
  } catch (err) {
    console.error(err);
    res.status(504).send({ mensaje: err });
  }
});

// POST Method that fires the CSV LOAD
app.post("/covid/update", async (req, res) => {
  try {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');

    const filePath = path.join(__dirname, "../UpdatedData.zip")
    const destDir = path.join(__dirname, "../")

    // First we search for misc data
    mongodb.MongoClient.connect(dbURL, {
      useUnifiedTopology: true,
    }).then((client) => {
      dbConn = client.db("covid");

      dbConn.collection('misc').find({}).toArray((err, results) => {
        if (err) throw err;
        
        // If Theres is information we use it.
        if (results.length === 1) {
          
          // CHecking if it is time update, if last updated date is less than today, we update
          if (isTimeToUpdate(results[0].lastUpdateDate)) {
            console.log("time to update...")
            // First download file..
            const file = fs.createWriteStream("UpdatedData.zip");

            const request = http.get("https://sisa.msal.gov.ar/datos/descargas/covid-19/files/Covid19Casos.zip", function (response) {
              response.pipe(file);

              response.on('end', async function () {
                // On Success we unzip it
                await extract(filePath, { dir: `${destDir}` }, (err) => {
                  if (err) console.error('extraction failed.');
                });
          
                // we stream data for better memory handling of the big csv file
                let stream = fs.createReadStream("Covid19Casos.csv");
                let csvData = [];
                let csvStream = fastcsv
                  .parse()
                  .on("data", function (data) {
                    // If the case is confirmed and the id_event is bigger than the previous one, we push it for import
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
                    // We have now traversed the entire file...
                    // remove the first line: header
                    csvData.shift();

                    mongodb.MongoClient.connect(
                      dbURL,
                      { useNewUrlParser: true, useUnifiedTopology: true },
                      (err, client) => {
                        if (err) throw err;
                        // Bulk import of data
                        client
                          .db("covid")
                          .collection("casos_1")
                          .insertMany(csvData, (err, response) => {
                            if (err) throw err;

                            // We search for the last id_event now
                            dbConn.collection('casos_1')
                              .find()
                              .sort({ "id_evento_caso": -1 })
                              .limit(1).toArray((err, results) => {
                                if (err) throw err;
                                var myobj;
                                if (results.length === 1) {
                                  lastRecordNumber = results[0].id_evento_caso;

                                  // Remove previous misc data
                                  dbConn.collection('misc').deleteMany({}, function (err, res) {
                                    if (err) throw err;
                                  });

                                  myobj = { lastUpdateCases: response.insertedCount, lastUpdateDate: todayParsed(), lastRecordNumber: lastRecordNumber }

                                  // new misc data with fresh import
                                  dbConn.collection('misc').insertOne(myobj, function (err, res) {
                                    if (err) throw err;
                                    client.close();
                                  });
                                  res.status(200).send({ lastUpdateCases: response.insertedCount, lastUpdateDate: todayParsed() });
                                }
                              });

                          });
                      }
                    );
                  });
                stream.pipe(csvStream);
              });
            });
          }
          else {
            console.log("well... its no time to update!!!!")
            res.status(201).send({});
            client.close();
          }
        }
      });
    }).catch(err => {
      console.error(`DB Connection Error: ${err.message}`);
      res.status(504).send({ mensaje: `DB Connection Error: ${err.message}` });
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


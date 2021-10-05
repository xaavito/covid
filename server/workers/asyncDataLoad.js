const { parentPort } = require("worker_threads");

const fastcsv = require("fast-csv");

// Import required module csvtojson and mongodb packages
const mongodb = require('mongodb');

const http = require('https');

const path = require('path');

//File accesor
const fs = require('fs');

// Unzipper
const extract = require('extract-zip')

//DB Connection String
const dbURL = 'mongodb://covid:covid@localhost:27017/covid';

parentPort.on("message", (data) => {
    //console.log("******* llegue con " + data)
    //const result = dbCall();
    //console.log("******* " + result)
    parentPort.postMessage(dbCall(data));
});

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

function dbCall(data) {
    let dataStruct = {
        lastUpdateCases: "2000",
        lastUpdateDate: "2021-09-99",
        lastRecordNumber: "1000000",
        errorMessage: data,
        status: 200
    }
    //console.log(dataStruct);
    //return dataStruct;

    let dbConn;

    const filePath = path.join(__dirname, "../../UpdatedData.zip")
    const destDir = path.join(__dirname, "../../")
    console.log(destDir)
    console.log(filePath)

    mongodb.MongoClient.connect(dbURL, {
        useUnifiedTopology: true,
    }).then((client) => {
        console.log("Worker thread: Connection OK")
        dbConn = client.db("covid");

        console.log("Worker thread: DB OK")
        dbConn.collection('misc').find({}).toArray((err, results) => {
            if (err) throw err;
            console.log("Worker thread: Find Misk DATA OK")
            // If Theres is information we use it.
            if (results.length === 1) {
                console.log("Worker thread: Misc length = 1")
                // CHecking if it is time update, if last updated date is less than today, we update
                if (isTimeToUpdate(results[0].lastUpdateDate)) {
                    console.log("Worker thread: Time to update")
                    // First download file..
                    const file = fs.createWriteStream("UpdatedData.zip");

                    const request = http.get("https://sisa.msal.gov.ar/datos/descargas/covid-19/files/Covid19Casos.zip", function (response) {
                        response.pipe(file);

                        response.on('end', async function () {
                            // On Success we unzip it
                            console.log("Worker thread: Downloaded FILE OK")
                            await extract(filePath, { dir: `${destDir}` }, (err) => {
                                if (err) console.error('extraction failed.');
                            });
                            console.log("Worker thread: Extraction OK")
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
                                    console.log("Worker thread: File parsed, about to insert")
                                    dbConn.collection("casos_1")
                                        .insertMany(csvData, (err, response) => {
                                            if (err) throw err;
                                            console.log("Worker thread: New casess added OK")
                                            // We search for the last id_event now
                                            dbConn.collection('casos_1')
                                                .find()
                                                .sort({ "id_evento_caso": -1 })
                                                .limit(1).toArray((err, results) => {
                                                    if (err) throw err;
                                                    console.log("Worker thread: Finded Latest event id")
                                                    var myobj;
                                                    if (results.length === 1) {
                                                        lastRecordNumber = results[0].id_evento_caso;

                                                        console.log("Worker thread: Connection 2 OK")
                                                        
                                                        // Remove previous misc data
                                                        dbConn.collection('misc').deleteMany({}, function (err, res) {
                                                            if (err) throw err;
                                                        });
                                                        console.log("Worker thread: Deleting Latest Misc")

                                                        myobj = { lastUpdateCases: response.insertedCount, lastUpdateDate: todayParsed(), lastRecordNumber: lastRecordNumber }
                                                        console.log("Worker thread: myObj " + JSON.stringify(myobj))
                                                        // new misc data with fresh import
                                                        dbConn.collection('misc').insertOne(myobj, function (err, res) {
                                                            if (err) throw err;
                                                            //client.close();
                                                        });

                                                        console.log("Worker thread: Inserting new misc")
                                                        dataStruct.status = 200;
                                                        dataStruct.lastUpdateCases = response.insertedCount;
                                                        dataStruct.lastUpdateDate = todayParsed();
                                                        dataStruct.lastRecordNumber = lastRecordNumber;
                                                        //res.status(200).send({ lastUpdateCases: response.insertedCount, lastUpdateDate: todayParsed() });
                                                        console.log("Worker thread: Done, returning")
                                                        //client.close();
                                                        return dataStruct;
                                                    }
                                                });

                                        });
                                });
                            stream.pipe(csvStream);
                        })
                        response.on('error', async function () { });
                    });
                }
                else {
                    console.log("well... its no time to update!!!!")
                    dataStruct.status = 201
                    client.close();
                    return dataStruct;
                }
            }
        });
    }).catch(err => {
        dataStruct.status = 504
        dataStruct.errorMessage = `DB Connection Error: ${err.message}`
        console.error(`DB Connection Error: ${err.message}`);
        //res.status(504).send({ message: `DB Connection Error: ${err.message}` });
        return dataStruct;
    });
}

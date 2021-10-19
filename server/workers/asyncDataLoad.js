const { parentPort } = require("worker_threads");

const fastcsv = require("fast-csv");

// Import required module csvtojson and mongodb packages
const mongodb = require('mongodb');

// HTTPS FILE DOWNLOADER HANDLER
const https = require('https');

const path = require('path');

//File accesor
const fs = require('fs');

// Unzipper
const extract = require('extract-zip')

// ENVIRONMENT CONFIG
const config = require('../config.js');

const { db: { auth, user, pass, host, dbport, name } } = config;

//DB Connection String
let dbURL;
if (auth) {
  dbURL = `mongodb://${user}:${pass}@${host}:${dbport}/${name}`;
}
else {
  dbURL = `mongodb://${host}:${dbport}/${name}`;
}

const filePath = path.join(__dirname, "../../UpdatedData.zip")
const destDir = path.join(__dirname, "../../")

const { app: { link } } = config;

// MAIN DATA INITIALIZATION
let dataStruct = {
    lastUpdateCases: "2000",
    lastUpdateDate: "2021-09-99",
    lastRecordNumber: "1000000",
    errorMessage: "data",
    status: 200
}
// FUNCTION WHICH EXECUTES ITSELFS WHEN RECEIVES MESSAGE FROM PARENT
parentPort.on("message", (data) => {
    dbCall(data);
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
// OPEN DATABASE FUNCTION
open = () => {
    return new Promise((resolve, reject) => {
        mongodb.MongoClient.connect(dbURL, (err, client) => { //Use "client" insted of "db" in the new MongoDB version
            if (err) {
                reject(err)
            } else {
                console.log("connection sucessfull")
                resolve(client);
            };
        });
    });
};
// GET MISCELANEUS DATA FROM DATABASE
getMiscData = (results) => {
    return new Promise((resolve, reject) => {
        if (results.length === 1) {
            if (isTimeToUpdate(results[0].lastUpdateDate)) {
                resolve({
                    lastUpdateDate: results[0].lastUpdateDate,
                    lastRecordNumber: results[0].lastRecordNumber
                });
            }
            else {
                dataStruct.status = 201
                reject(dataStruct);
            }
        }
        else {
            reject("No Time To Update...")
        }
    });
};

// THE MAIN PROCESS WHICH ACTUALLY DOWNLOAD, PROCESS AND RETURN CSV TO INSERT INTO DATABASE
processFile = (results) => {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream("UpdatedData.zip");

        const request = https.get(link, function (response) {
            response.pipe(file);

            response.on('end', async function () {
                // On Success we unzip it
                console.log("Worker thread: Downloaded FILE OK")
                await extract(filePath, { dir: `${destDir}` }, (err) => {
                    if (err) {
                        console.error('extraction failed.')
                        reject(err)
                    };
                });
                console.log("Worker thread: Extraction OK")
                // we stream data for better memory handling of the big csv file
                let stream = fs.createReadStream("Covid19Casos.csv");
                let csvData = [];
                let csvStream = fastcsv
                    .parse()
                    .on("data", function (data) {
                        // If the case is confirmed and the id_event is bigger than the previous one, we push it for import
                        if (data[20] === "Confirmado" && Number(data[0]) > Number(results.lastRecordNumber)) {
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
                        resolve(csvData);
                    });
                stream.pipe(csvStream);
            })
        });
    });
};
// DATABASE HANDLING FUNCTION.
function dbCall(data) {
    let database;
    let clientMain;
    let myObj;
    let lastRecordNumber;
    let insertedCount;

    open()
        .then((client) => {
            clientMain = client
            database = client.db("covid");
            return database.collection("misc").find({}).toArray();
        })
        .then((results) => {
            return getMiscData(results)
        })
        .then((results) => {
            return processFile(results)
        })
        .then((results) => {
            return database.collection("casos_1").insertMany(results);
        })
        .then((results) => {
            insertedCount = results.insertedCount
            return database.collection('casos_1')
                .find()
                .sort({ "id_evento_caso": -1 })
                .limit(1)
        })
        .then((result) => {
            lastRecordNumber = result.id_evento_caso;
            return database.collection('misc').deleteMany({});
        })
        .then((result) => {
            myObj = { lastUpdateCases: insertedCount, lastUpdateDate: todayParsed(), lastRecordNumber: lastRecordNumber }
            return database.collection('misc').insertOne(myObj);
        })
        .then((result) => {
            dataStruct.status = 200;
            dataStruct.lastUpdateCases = myObj.lastUpdateCases;
            dataStruct.lastUpdateDate = myObj.lastUpdateDate;
            dataStruct.lastRecordNumber = myObj.lastRecordNumber;
            return dataStruct;
        })
        .then((result) => {
            clientMain.close();
            parentPort.postMessage(result)
        })
        .catch((err) => {
            if (clientMain) {
                clientMain.close();
            }
            if (err.status && err.status === 201) {
                parentPort.postMessage(err)
            }
            else {
                dataStruct.status = 504
                dataStruct.errorMessage = err.message
                console.error(err.message);
                parentPort.postMessage(dataStruct)
            }
        })
}

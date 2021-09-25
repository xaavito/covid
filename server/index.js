const path = require('path');
const express = require("express");
const bodyParser = require('body-parser');
const pino = require('express-pino-logger')();
var cors = require('cors')

const PORT = process.env.PORT || 3001;

const app = express();
// Have Node serve the files for our built React app
app.use(express.static(path.resolve(__dirname, '../client/build')));

// PARA EVITAR EL TEMA DE LA RESTRICCION DE DONDE LE PEGAN MUCHO BARDO CON LOCALHOST
app.use(cors());
// PINO LOGGER
app.use(pino);

// PARSEO MAGICO DE JSON DEL BODY
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: false })); // support encoded bodies


// Handle GET requests to /api route
app.get("/api", (req, res) => {
  res.json({ message: "Hello from server!" });
});

app.get("/covid/total", async (req, res) => {
  try {
    console.log("/covid/deaths");
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');

    //si falla usar .json(resultadoConfirmados.rows)
    res.status(200).send({ newCases: '200' });
  } catch (err) {
    console.error(err);
    res.status(504).send({ mensaje: err });
  }
});

app.get("/covid/deaths", async (req, res) => {
  try {
    console.log("/covid/deaths");
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');

    //si falla usar .json(resultadoConfirmados.rows)
    res.status(200).send({ covidDetahs: '50' });
  } catch (err) {
    console.error(err);
    res.status(504).send({ mensaje: err });
  }
});

app.get("/covid/update", async (req, res) => {
  try {
    console.log("/covid/deaths");
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');

    //si falla usar .json(resultadoConfirmados.rows)
    res.status(200).send({ lastUpdateCases: '2000' , lastUpdateDate: 'yesterday'});
  } catch (err) {
    console.error(err);
    res.status(504).send({ mensaje: err });
  }
});

app.post("/covid/update", async (req, res) => {
  try {
    console.log("/covid/deaths");
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');

    //si falla usar .json(resultadoConfirmados.rows)
    res.status(200).send({ status: 'Success' });
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


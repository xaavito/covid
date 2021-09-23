const path = require('path');

const express = require("express");

const PORT = process.env.PORT || 3001;

const app = express();
// Have Node serve the files for our built React app
app.use(express.static(path.resolve(__dirname, '../client/build')));

// Handle GET requests to /api route
app.get("/api", (req, res) => {
  res.json({ message: "Hello from server!" });
});

app.get("/covid/total", (req, res) => {
  req.query.date_from
  req.query.date_to
  req.query.age_from
  req.query.age_to
  req.query.sex
  req.query.province

  res.json({ message: "/covid/total" });
});

app.get("/covid/deaths", (req, res) => {
  req.query.date_from
  req.query.date_to
  req.query.age_from
  req.query.age_to
  req.query.sex
  req.query.province
  res.json({ message: "/covid/deaths"});
});

app.get("/covid/update", (req, res) => {
  res.json({ message: req.query.date_from });
});

app.post("/covid/update", (req, res) => {
  res.json({ message: "/covid/update" });
});

// All other GET requests not handled before will return our React app
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});


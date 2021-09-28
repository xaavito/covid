import * as React from 'react';
import { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import CssBaseline from '@mui/material/CssBaseline';
import Grid from '@mui/material/Grid';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import GlobalStyles from '@mui/material/GlobalStyles';
import Container from '@mui/material/Container';
import DatePicker from "react-datepicker";
import Select from "react-dropdown-select";

import "react-datepicker/dist/react-datepicker.css";
import "./App.css";

import { sexes, provinces } from "./options"

function Copyright(props) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {'Copyright © '}
      <Link color="inherit" href="https://material-ui.com/">
        Covid Bot
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

var ages = [];

function loadingAges() {
  if (ages.length === 0) {
    for (var i = 0; i < 120; i++) {
      ages.push({
        label: i,
        value: i
      })
    }
  }
}

function App() {

  loadingAges();

  updateCases();

  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();

  const [ageFrom, setAgeFrom] = useState();
  const [ageTo, setAgeTo] = useState();

  const [sex, setSex] = useState();
  const [province, setProvince] = useState();

  // Responses error
  // eslint-disable-next-line
  const [response, setResponse] = useState(null);
  // eslint-disable-next-line
  const [error, setError] = useState(false);

  // Response Datos
  // eslint-disable-next-line
  const [deaths, setDeaths] = useState(0);
  // eslint-disable-next-line
  const [newCases, setNewCases] = useState(0);
  // eslint-disable-next-line
  const [lastUpdated, setLastUpdated] = useState();
  // eslint-disable-next-line
  const [newRegistriesAdded, setNewRegistriesAdded] = useState(0);

  const [errorMessage, setErrorMessage] = useState(null);

  function getParsedDate(strDate) {
    var strSplitDate = String(strDate).split('/');
    var date = ""

    date = strSplitDate[2] + "-" + ('0' + strSplitDate[1]).slice(-2) + "-" + ('0' + strSplitDate[0]).slice(-2);
    //console.log(date);
    return date;
  }

  function getQueryString() {
    var qs = ""
    if (startDate != null) {
      qs += `?startDate=${getParsedDate(startDate.toLocaleDateString('es-ar'))}`
    }
    if (endDate != null) {
      qs += `&endDate=${getParsedDate(endDate.toLocaleDateString('es-ar'))}`
    }
    //console.log(ageFrom[0])
    if (ageFrom[0] != null) {
      qs += `&ageFrom=${ageFrom[0].value}`
    }
    if (ageTo[0] != null) {
      qs += `&ageTo=${ageTo[0].value}`
    }
    if (sex[0] != null) {
      qs += `&sex=${sex[0].value}`
    }
    if (province[0] != null) {
      qs += `&province=${province[0].value}`
    }
    //console.log("query string resultante " + qs);
    return qs;
  }

  function updateCases() {
    let status;

    fetch(`http://localhost:3001/covid/update`, {
      method: 'GET',
      headers: {
        'Accept': 'text/html',
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'http://localhost:3001',
        // eslint-disable-next-line
        'Access-Control-Allow-Origin': '*',
      }
    }).then((res) => {
      status = Number(res.status);
      setResponse(status);

      if (status >= 500) {
        setError(true);
      }
      return res.json();
    })
      .then((data) => {
        if (status === 200) {
          setLastUpdated(data.lastUpdateDate);
          setNewRegistriesAdded(data.lastUpdateCases);
        }
        else {
          setErrorMessage(data.mensaje);
          return;
        }
      })
      .catch((error) => {
        setError(true);
        setErrorMessage(error);
      });
  }

  function synchronizeCases() {
    setErrorMessage("Sync in place, this may take a few minutes...");
    let status;

    fetch(`http://localhost:3001/covid/update`, {
      method: 'POST',
      headers: {
        'Accept': 'text/html',
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'http://localhost:3001',
        // eslint-disable-next-line
        'Access-Control-Allow-Origin': '*',
      }
    }).then((res) => {
      status = Number(res.status);
      setResponse(status);

      if (status >= 500) {
        setError(true);
      }
      return res.json();
    })
      .then((data) => {
        // we have received new data
        if (status === 200) {
          setLastUpdated(data.lastUpdateDate);
          setNewRegistriesAdded(data.lastUpdateCases);
          setErrorMessage();
          updateCases();
        }
        // no new data
        else if (status === 201) {
          setErrorMessage();
        }
        else {
          setErrorMessage(data.mensaje);
          return;
        }
      })
      .catch((error) => {
        console.log('error: ' + error);
        setError(true);
        setErrorMessage(error);
      });
  }

  function filter() {
    if (!startDate || !endDate) {
      setErrorMessage("Please select Start Date and End Date");
      return;
    }

    if (typeof ageFrom === 'undefined' || typeof ageTo === 'undefined') {
      setErrorMessage("Please select Age From and Age To");
      return;
    }

    if (typeof sex === 'undefined') {
      setErrorMessage("Please select Sex");
      return;
    }

    if (typeof province === 'undefined') {
      setErrorMessage("Please select Province");
      return;
    }

    setErrorMessage("Loading... please wait..");

    let status;
    fetch(`http://localhost:3001/covid/total${getQueryString()}`, {
      method: 'GET',
      headers: {
        'Accept': 'text/html',
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'http://localhost:3001',
        // eslint-disable-next-line
        'Access-Control-Allow-Origin': '*',
      }
    }).then((res) => {
      status = Number(res.status);
      setResponse(status);

      if (status >= 500) {
        setError(true);
      }
      return res.json();
    })
      .then((data) => {
        if (status === 200) {
          setNewCases(data.newCases)
          setErrorMessage();
        }
        else {
          setErrorMessage(data.mensaje);
          return;
        }
      })
      .catch((error) => {
        console.error('error: ' + error);
        setError(true);
        setErrorMessage(response.mensaje);
        return;
      });

    fetch(`http://localhost:3001/covid/deaths${getQueryString()}`, {
      method: 'GET',
      headers: {
        'Accept': 'text/html',
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'http://localhost:3001',
        // eslint-disable-next-line
        'Access-Control-Allow-Origin': '*',
      }
    }).then((res) => {
      status = Number(res.status);
      setResponse(status);
      if (status >= 500) {
        setError(true);
      }
      return res.json();
    })
      .then((data) => {
        if (status === 200) {
          setDeaths(data.covidDeaths)
          setErrorMessage();
        }
        else {
          setErrorMessage(data.mensaje);
          return;
        }
      })
      .catch((error) => {
        setError(true);
        setErrorMessage(error);
      });
  }

  return (
    <React.Fragment>
      <GlobalStyles styles={{ ul: { margin: 0, padding: 0, listStyle: 'none' } }} />
      <CssBaseline />
      <AppBar
        position="static"
        color="default"
        elevation={0}
        sx={{ borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}
      >
        <Toolbar sx={{ flexWrap: 'wrap' }}>
          <Typography variant="h6" color="inherit" noWrap sx={{ flexGrow: 1 }}>
            Covid Bot by Javier Gonzalez
          </Typography>
          <nav>
            <h3 className="error"> {errorMessage} </h3>
          </nav>
        </Toolbar>
      </AppBar>
      {/* Hero unit */}
      <Container disableGutters maxWidth="sm" component="main" sx={{ pt: 8, pb: 6 }}>
        <Typography
          component="h1"
          variant="h2"
          align="center"
          color="text.primary"
          gutterBottom
        >
          Covid-bot
        </Typography>

      </Container>
      {/* End hero unit */}
      <Container maxWidth="md" component="main">
        <Grid container spacing={5} alignItems="flex-end">
          <Grid
            item
            key={"Prueba"}
            xs={12}
            sm={12}
            md={6}
          >
            <Card>
              <CardHeader
                title={"Filters"}
                titleTypographyProps={{ align: 'center' }}
                action={null}
                subheaderTypographyProps={{
                  align: 'left',
                }}
                sx={{
                  backgroundColor: (theme) =>
                    theme.palette.mode === 'light'
                      ? theme.palette.grey[200]
                      : theme.palette.grey[700],
                }}
              />

              <CardContent>
                <table>
                  <tbody>
                    <tr>
                      <td>
                        <label className="filter-font-big">Date</label>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <label>From:</label>
                      </td>
                      <td>
                        <DatePicker selected={startDate}
                          onChange={setStartDate}
                          placeholderText="Fecha Desde"
                          dateFormat="dd/MM/yyyy"
                          value={startDate}
                          className="combo-large" />
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <label>To:</label>
                      </td>
                      <td>
                        <DatePicker selected={endDate}
                          onChange={setEndDate}
                          placeholderText="Fecha Hasta"
                          dateFormat="dd/MM/yyyy"
                          className="combo-large" />
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <label className="filter-font-big">Age</label>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <label>From:</label>
                      </td>

                      <td className="combo-large"><Select value={ageFrom} key="id" options={ages} onChange={setAgeFrom} placeholderText="Seleccione una fecha!" /></td>
                    </tr>
                    <tr>
                      <td>
                        <label>To:</label>
                      </td>

                      <td className="combo-large"><Select value={ageTo} options={ages} onChange={setAgeTo} placeholderText="Seleccione una fecha!" /></td>
                    </tr>
                    <tr>
                      <td>
                        <label className="filter-font-big">Others</label>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <label>Sex:</label>
                      </td>
                      <td className="combo-large">
                        <Select value={sex} options={sexes} onChange={setSex} />
                      </td>
                    </tr>

                    <tr>
                      <td>
                        <label>Province:</label>
                      </td>

                      <td className="combo-large">
                        <Select value={province} key="id" options={provinces} onChange={setProvince}
                          menuPortalTarget={document.querySelector('body')} />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </CardContent>
              <CardActions>
                <Button variant="contained" onClick={filter}>Filter</Button>
              </CardActions>
            </Card>
          </Grid>
          <Grid
            item
            key={"Results"}
            xs={12}
            sm={12}
            md={6}
          >
            <Card>
              <CardHeader
                title={"Results"}
                titleTypographyProps={{ align: 'center' }}
                action={null}
                subheaderTypographyProps={{
                  align: 'center',
                }}
                sx={{
                  backgroundColor: (theme) =>
                    theme.palette.mode === 'light'
                      ? theme.palette.grey[200]
                      : theme.palette.grey[700],
                }}
              />
              <CardContent className="center-aligned">
                <table className="combo-large">
                  <tbody>
                    <tr>
                      <td>
                        <label className="font-bigger">{newCases}</label>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <label className="font-big">Registered Cases</label>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <label className="font-bigger">{deaths}</label>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <label className="font-big">Deaths</label>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <label className="font-small">Last import made on {lastUpdated}, {newRegistriesAdded} registries added</label>
                      </td>
                    </tr>
                    <tr>
                      <td className="empty-td">
                      </td>
                    </tr>
                  </tbody>
                </table>
              </CardContent>
              <CardActions>
                <Button variant="contained" onClick={synchronizeCases}>Synchronize</Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      </Container>
      {/* Footer */}
      <Container
        maxWidth="md"
        component="footer"
        sx={{
          borderTop: (theme) => `1px solid ${theme.palette.divider}`,
          mt: 8,
          py: [3, 6],
        }}
      >

        <Grid container spacing={4} justifyContent="space-evenly">
        </Grid>
        <Copyright sx={{ mt: 5 }} />
      </Container>
      {/* End footer */}
    </React.Fragment >
  );
}

export default function Pricing() {
  return <App />;
}
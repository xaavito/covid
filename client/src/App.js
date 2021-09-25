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

import { ages, sexes, provinces } from "./options"

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


function App() {

  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();

  const [ageFrom, setAgeFrom] = useState(ages[1]);
  const [ageTo, setAgeTo] = useState(ages[50]);

  const [sex, setSex] = useState(sexes[0]);
  const [province, setProvince] = useState(provinces[1]);

  // Responses error
  // eslint-disable-next-line
  const [response, setResponse] = useState(null);
  // eslint-disable-next-line
  const [error, setError] = useState(null);

  // Response Datos
  // eslint-disable-next-line
  const [deaths, setDeaths] = useState(0);
  // eslint-disable-next-line
  const [newCases, setNewCases] = useState(0);
  // eslint-disable-next-line
  const [lastUpdated, setLastUpdated] = useState(new Date());
  // eslint-disable-next-line
  const [newRegistriesAdded, setNewRegistriesAdded] = useState(0);

  const [errorMessage, setErrorMessage] = useState(null);


  function synchronizeCases() {
    fetch(`http://localhost:3001/covid/update`, {
      method: 'GET',
      headers: {
        'Accept': 'text/html',
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'http://localhost:3001',
        // eslint-disable-next-line
        'Access-Control-Allow-Origin': '*',
      }
    }).then((response) => {
      console.log(response)
      setResponse(response.status);

      if (response.status >= 500) {
        setError(true);
        setErrorMessage(response.mensaje)
      }
      return response.json();
    })
      .then((data) => {
        setLastUpdated(data.lastUpdateDate);
        setNewRegistriesAdded(data.lastUpdateCases);
      })
      .catch((error) => {
        console.log('error: ' + error);
        setError(true);
        setErrorMessage(response.mensaje);
      });

  }

  function filtrar() {
    //console.log("a verrr " + sex[0].value + " " + startDate.format + " " + endDate + " " + ageFrom[0].value + " " + ageTo[0].value + " " + province[0].value);

    fetch(`http://localhost:3001/covid/total?startDate=${startDate}&endDate=${endDate}&ageFrom=${ageFrom[0].value}&ageTo=${ageTo[0].value}&sex=${sex[0].value}&province=${province[0].value}`, {
      method: 'GET',
      headers: {
        'Accept': 'text/html',
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'http://localhost:3001',
        // eslint-disable-next-line
        'Access-Control-Allow-Origin': '*',
      }
    }).then((response) => {
      console.log(response)
      setResponse(response.status);

      if (response.status >= 500) {
        setError(true);
        setErrorMessage(response.mensaje);
      }
      return response.json();
    })
      .then((data) => {
        setNewCases(data.newCases)
      })
      .catch((error) => {
        console.log('error: ' + error);
        setError(true);
        setErrorMessage(response.mensaje);
      });

    fetch(`http://localhost:3001/covid/deaths?startDate=${startDate}&endDate=${endDate}&ageFrom=${ageFrom[0].value}&ageTo=${ageTo[0].value}&sex=${sex[0].value}&province=${province[0].value}`, {
      method: 'GET',
      headers: {
        'Accept': 'text/html',
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'http://localhost:3001',
        // eslint-disable-next-line
        'Access-Control-Allow-Origin': '*',
      }
    }).then((response) => {
      console.log(response)
      setResponse(response.status);

      if (response.status >= 500) {
        setError(true);
        setErrorMessage(response.mensaje);
      }
      return response.json();
    })
      .then((data) => {
        setDeaths(data.covidDeaths)
      })
      .catch((error) => {
        console.log('error: ' + error);
        setError(true);
        setErrorMessage(response.mensaje);
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
        <Typography variant="h5" align="center" color="text.secondary" component="p">
          Aplicacion para la obtencion de resultados de COVID provistos por
          http://datos.salud.gob.ar/dataset/covid-19-casos-registrados-en-la-republica-argentina
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
                title={"Filtros"}
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
                        <Select value={province} key="id" options={provinces} onChange={setProvince} />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </CardContent>
              <CardActions>
                <Button variant="contained" onClick={filtrar}>Filter</Button>
              </CardActions>
            </Card>
          </Grid>
          <Grid
            item
            key={"Resultados"}
            xs={12}
            sm={12}
            md={6}
          >
            <Card>
              <CardHeader
                title={"Resultados"}
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
                        <label className="font-small">Last import made on {lastUpdated.toDateString}, {newRegistriesAdded} registries added</label>
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
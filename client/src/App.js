import * as React from 'react';
import { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
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
  
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  const [ageFrom, setAgeFrom] = useState(1);
  const [ageTo, setAgeTo] = useState(50);

  const [sex, setSex] = useState(0);
  const [province, setProvince] = useState(1);
  
  function filtrar() {
    console.log("a verrr " + sex + " " + startDate + " " + endDate + " " + ageFrom +" " + ageTo +" " + province)
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
            Company name
          </Typography>
          <nav>
            <Link
              variant="button"
              color="text.primary"
              href="#"
              sx={{ my: 1, mx: 1.5 }}
            >
              Features
            </Link>
            <Link
              variant="button"
              color="text.primary"
              href="#"
              sx={{ my: 1, mx: 1.5 }}
            >
              Enterprise
            </Link>
            <Link
              variant="button"
              color="text.primary"
              href="#"
              sx={{ my: 1, mx: 1.5 }}
            >
              Support
            </Link>
          </nav>
          <Button href="#" variant="outlined" sx={{ my: 1, mx: 1.5 }}>
            Login
          </Button>
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
                  align: 'center',
                }}
                sx={{
                  backgroundColor: (theme) =>
                    theme.palette.mode === 'light'
                      ? theme.palette.grey[200]
                      : theme.palette.grey[700],
                }}
              />
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'baseline',
                    mb: 1,
                  }}
                >
                  <DatePicker selected={startDate}
                    onChange={setStartDate}
                    placeholderText="Fecha Desde"
                    dateFormat="dd/MM/yyyy"
                    value={startDate} />

                  <DatePicker selected={endDate}
                    onChange={setEndDate}
                    placeholderText="Fecha Hasta"
                    dateFormat="dd/MM/yyyy" />
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'baseline',
                    mb: 1,
                  }}
                >
                  <Select value={ageFrom} options={ages} onChange={setAgeFrom} />

                  <Select value={ageTo} options={ages} onChange={setAgeTo} />
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'baseline',
                    mb: 1,
                  }}
                >

                  <Select value={sex} options={sexes} onChange={setSex} />

                  <Select value={province} options={provinces} onChange={setProvince} />
                </Box>
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
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'baseline',
                    mb: 2,
                  }}
                >
                </Box>
              </CardContent>
              <CardActions>
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
    </React.Fragment>
  );
}

export default function Pricing() {
  return <App />;
}
import * as React from 'react';
import { useState } from 'react';

import CssBaseline from '@mui/material/CssBaseline';

import GlobalStyles from '@mui/material/GlobalStyles';

import CovidBar from './components/CovidBar';
import MainTitle from './components/MainTitle';
import Footer from './components/Footer';
import MainBody from './components/MainBody';

import "react-datepicker/dist/react-datepicker.css";
import "./App.css";

import { httpHeaders } from "./options"

function App() {
  updateCases();

  const [syncDisabled, setSyncDisabled] = useState(false);

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

  const [errorMessage, setErrorMessage] = useState(null);

  // Response Datos
  // eslint-disable-next-line
  const [deaths, setDeaths] = useState(0);
  // eslint-disable-next-line
  const [newCases, setNewCases] = useState(0);
  // eslint-disable-next-line
  const [lastUpdated, setLastUpdated] = useState();
  // eslint-disable-next-line
  const [newRegistriesAdded, setNewRegistriesAdded] = useState(0);


  function getParsedDate(strDate) {
    var strSplitDate = String(strDate).split('/');
    var date = ""

    date = strSplitDate[2] + "-" + ('0' + strSplitDate[1]).slice(-2) + "-" + ('0' + strSplitDate[0]).slice(-2);
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
    //console.log(ageFrom.value);
    if (ageFrom != null) {
      qs += `&ageFrom=${ageFrom.value}`
    }
    if (ageTo != null) {
      qs += `&ageTo=${ageTo.value}`
    }
    if (sex != null) {
      qs += `&sex=${sex.value}`
    }
    if (province != null) {
      qs += `&province=${province.value}`
    }
    //console.log("query string resultante " + qs);
    return qs;
  }

  function updateCases() {
    let status;

    fetch(`http://localhost:3001/covid/update`, {
      method: 'GET',
      headers: httpHeaders
    }).then((res) => {
      status = Number(res.status);
      setResponse(status);

      if (status >= 500) {
        console.log("errrroooorrr!");
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
          setErrorMessage(data.message);
          return;
        }
      })
      .catch((error) => {
        setError(true);
        setErrorMessage(JSON.stringify(error));
      });
  }

  function synchronizeCases() {
    setErrorMessage("Sync in place, this may take a few minutes...");
    setSyncDisabled(true);
    let status;

    //console.log("sync")
    fetch(`http://localhost:3001/covid/update`, {
      method: 'POST',
      headers: httpHeaders
    }).then((res) => {
      status = Number(res.status);
      setResponse(status);
      //console.log(status)
      if (status >= 500) {
        //console.log("err")
        setError(true);
      }
      return res.json();
    })
      .then((data) => {
        if (status === 200) {
          //console.log("200 " + data.lastUpdateDate)
          setLastUpdated(data.lastUpdateDate);
          setNewRegistriesAdded(data.lastUpdateCases);
          setErrorMessage();
          setSyncDisabled(false);
        }
        // no new data
        else if (status === 201) {
          //console.log("201")
          setErrorMessage();
          setSyncDisabled(false);
        }
        else {
          //console.log("504")
          setErrorMessage(data.message);
          setSyncDisabled(false);
          return;
        }
      })
      .catch((error) => {
        console.log('error: ' + error);
        setError(true);
        setSyncDisabled(false);
        setErrorMessage(JSON.stringify(error));
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

    Promise.all([fetch(`http://localhost:3001/covid/total${getQueryString()}`, {
      method: 'GET',
      headers: httpHeaders
    }), fetch(`http://localhost:3001/covid/deaths${getQueryString()}`, {
      method: 'GET',
      headers: httpHeaders
    })])
      .then(([res1, res2]) => {
        status = Number(res1.status);
        setResponse(res1.status);

        if (status >= 500) {
          setError(true);
        }
        return Promise.all([res1.json(), res2.json()])
      })
      .then(([res1JSON, res2JSON]) => {
        if (status === 200) {
          setNewCases(res1JSON.newCases);
          setDeaths(res2JSON.deaths);
          setErrorMessage();
        }
        else {
          setErrorMessage(res1JSON.message);
          return;
        }
      }).catch((err) => {
        console.log(err);
        setError(true);
        setErrorMessage(JSON.stringify(err));
      });
  }

  return (
    <React.Fragment>
      <GlobalStyles styles={{ ul: { margin: 0, padding: 0, listStyle: 'none' } }} />
      <CssBaseline />
      <CovidBar errorMessage={errorMessage} />
      <MainTitle />
      <MainBody sex={sex} setSex={setSex}
        province={province} setProvince={setProvince}
        ageTo={ageTo} setAgeTo={setAgeTo}
        ageFrom={ageFrom} setAgeFrom={setAgeFrom}
        startDate={startDate} setStartDate={setStartDate}
        endDate={endDate} setEndDate={setEndDate}
        filter={filter} newCases={newCases} deaths={deaths}
        lastUpdated={lastUpdated} newRegistriesAdded={newRegistriesAdded}
        syncDisabled={syncDisabled} synchronizeCases={synchronizeCases} />
      <Footer />
    </React.Fragment >
  );
}

export default function CovidBot() {
  return <App />;
}
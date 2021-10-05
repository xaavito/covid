
import * as React from 'react';

import FilterCard from './FilterCard';
import ResultsCard from './ResultsCard';

import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';

export default function MainBody(props) {

  return (
    <Container maxWidth="md" component="main">
      <Grid container spacing={5} alignItems="flex-end">
        <Grid
          item
          key={"Filter"}
          xs={12}
          sm={12}
          md={6}
        >
          <FilterCard sex={props.sex} setSex={props.setSex}
            province={props.province} setProvince={props.setProvince}
            ageTo={props.ageTo} setAgeTo={props.setAgeTo}
            ageFrom={props.ageFrom} setAgeFrom={props.setAgeFrom}
            startDate={props.startDate} setStartDate={props.setStartDate}
            endDate={props.endDate} setEndDate={props.setEndDate}
            filter={props.filter} />
        </Grid>
        <Grid
          item
          key={"Results"}
          xs={12}
          sm={12}
          md={6}
        >
          <ResultsCard newCases={props.newCases} deaths={props.deaths}
            lastUpdated={props.lastUpdated} newRegistriesAdded={props.newRegistriesAdded}
            syncDisabled={props.syncDisabled} synchronizeCases={props.synchronizeCases} />
        </Grid>
      </Grid>
    </Container>
  );
}
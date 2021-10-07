
import * as React from 'react';

import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';

import Grid from '@mui/material/Grid';

import Button from '@mui/material/Button';

export default function ResultsCard(props) {

  return (
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
        <Grid container spacing={2}>
          <Grid item xs={12} className="filter-grid-item">
            <label className="font-bigger">{props.newCases}</label>
          </Grid>

          <Grid item xs={12} className="filter-grid-item">
            <label className="font-big">Registered Cases</label>
          </Grid>

          <Grid item xs={12} className="filter-grid-item">
            <label className="font-bigger">{props.deaths}</label>
          </Grid>

          <Grid item xs={12} className="filter-grid-item">
            <label className="font-big">Deaths</label>
          </Grid>

          <Grid item xs={12} className="filter-grid-item">
            <label className="font-small">Last import made on {props.lastUpdated}, {props.newRegistriesAdded} registries added</label>
          </Grid>
        </Grid>
      </CardContent>
      <CardActions>
        <Button variant="contained" disabled={props.syncDisabled} onClick={props.synchronizeCases}>Synchronize</Button>
      </CardActions>
    </Card>

  );
}
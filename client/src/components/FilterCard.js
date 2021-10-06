
import * as React from 'react';

import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';

import Button from '@mui/material/Button';

import DatePicker from "react-datepicker";
import Select from 'react-select';
//import Select from "react-dropdown-select";

import { sexes, provinces } from "../options"

import Grid from '@mui/material/Grid';

import "../App.css";

export default function FilterCard(props) {

  var ages = [];

  function loadAges() {
    if (ages.length === 0) {
      for (var i = 0; i < 120; i++) {
        ages.push({
          label: i,
          value: i
        })
      }
    }
  }

  loadAges();

  return (
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
        <Grid container spacing={2}>
          <Grid item xs={12} className="filter-grid-item">
            <label className="filter-font-big">Date</label>
          </Grid>
          <Grid item xs={3} className="filter-grid-item">
            <label>From:</label>
          </Grid>
          <Grid item xs={9} className="filter-grid-item">
            <DatePicker selected={props.startDate}
              placeholderText="Date from"
              onChange={props.setStartDate}
              dateFormat="dd/MM/yyyy"
              value={props.startDate}
              className="combo-large" />
          </Grid>

          <Grid item xs={3} className="filter-grid-item">
            <label>To:</label>
          </Grid>
          <Grid item xs={9} className="filter-grid-item">
            <DatePicker selected={props.endDate}
              placeholderText="Date to"
              onChange={props.setEndDate}
              dateFormat="dd/MM/yyyy"
              className="combo-large" />
          </Grid>

          <Grid item xs={12} className="filter-grid-item">
            <label className="filter-font-big">Age</label>
          </Grid>
          <Grid item xs={3} className="filter-grid-item">
            <label>From:</label>
          </Grid>
          <Grid item xs={9} className="filter-grid-item">
            <Select value={props.ageFrom} key="id" options={ages} onChange={props.setAgeFrom} placeholderText="Seleccione una fecha!" menuPortalTarget={document.body}
              styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }} />
          </Grid>

          <Grid item xs={3} className="filter-grid-item">
            <label>To:</label>
          </Grid>
          <Grid item xs={9} className="filter-grid-item">
            <Select value={props.ageTo} options={ages} onChange={props.setAgeTo} placeholderText="Seleccione una fecha!" menuPortalTarget={document.body}
              styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }} />
          </Grid>

          <Grid item xs={12} className="filter-grid-item">
            <label className="filter-font-big">Others</label>
          </Grid>

          <Grid item xs={3} className="filter-grid-item">
            <label>Sex:</label>
          </Grid>
          <Grid item xs={9} className="filter-grid-item">
            <Select value={props.sex} options={sexes} onChange={props.setSex} menuPortalTarget={document.body}
              styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }} />
          </Grid>


          <Grid item xs={3} className="filter-grid-item">
            <label>Province:</label>
          </Grid>
          <Grid item xs={9} className="filter-grid-item">
            <Select value={props.province} key="id" options={provinces} onChange={props.setProvince} menuPortalTarget={document.body}
              styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }} />
          </Grid>
        </Grid>
      </CardContent>
      <CardActions>
        <Button variant="contained" onClick={props.filter}>Filter</Button>
      </CardActions>
    </Card>
  );
}

import * as React from 'react';

import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';

import Button from '@mui/material/Button';

import DatePicker from "react-datepicker";
import Select from "react-dropdown-select";

import { sexes, provinces } from "../options"

import Grid from '@mui/material/Grid';

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
          <Grid item xs={8}>
            xs=8
          </Grid>
          <Grid item xs={4}>
            xs=4
          </Grid>
          <Grid item xs={4}>
            xs=4
          </Grid>
          <Grid item xs={8}>
            xs=8
          </Grid>
        </Grid>
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
                <DatePicker selected={props.startDate}
                  placeholderText="Date from"
                  onChange={props.setStartDate}
                  dateFormat="dd/MM/yyyy"
                  value={props.startDate}
                  className="combo-large" />
              </td>
            </tr>
            <tr>
              <td>
                <label>To:</label>
              </td>
              <td>
                <DatePicker selected={props.endDate}
                  placeholderText="Date to"
                  onChange={props.setEndDate}
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

              <td className="combo-large"><Select value={props.ageFrom} key="id" options={ages} onChange={props.setAgeFrom} placeholderText="Seleccione una fecha!" /></td>
            </tr>
            <tr>
              <td>
                <label>To:</label>
              </td>

              <td className="combo-large"><Select value={props.ageTo} options={ages} onChange={props.setAgeTo} placeholderText="Seleccione una fecha!" /></td>
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
                <Select value={props.sex} options={sexes} onChange={props.setSex} />
              </td>
            </tr>

            <tr>
              <td>
                <label>Province:</label>
              </td>

              <td className="combo-large">
                <Select value={props.province} key="id" options={provinces} onChange={props.setProvince} />
              </td>
            </tr>
          </tbody>
        </table>
      </CardContent>
      <CardActions>
        <Button variant="contained" onClick={props.filter}>Filter</Button>
      </CardActions>
    </Card>
  );
}
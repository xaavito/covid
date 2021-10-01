
import * as React from 'react';

import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';

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
        <table className="combo-large">
          <tbody>
            <tr>
              <td>
                <label className="font-bigger">{props.newCases}</label>
              </td>
            </tr>
            <tr>
              <td>
                <label className="font-big">Registered Cases</label>
              </td>
            </tr>
            <tr>
              <td>
                <label className="font-bigger">{props.deaths}</label>
              </td>
            </tr>
            <tr>
              <td>
                <label className="font-big">Deaths</label>
              </td>
            </tr>
            <tr>
              <td>
                <label className="font-small">Last import made on {props.lastUpdated}, {props.newRegistriesAdded} registries added</label>
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
        <Button variant="contained" disabled={props.syncDisabled} onClick={props.synchronizeCases}>Synchronize</Button>
      </CardActions>
    </Card>

  );
}
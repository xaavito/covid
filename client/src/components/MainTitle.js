
import * as React from 'react';

import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';

export default function MainTitle() {

  return (
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

  );
}
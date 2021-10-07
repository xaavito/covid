
import * as React from 'react';

import Copyright from './Copyright';
import Container from '@mui/material/Container';

export default function Footer(props) {

  return (
    <Container className="footer"
      maxWidth="md"
      component="footer"
      sx={{
        borderTop: (theme) => `1px solid ${theme.palette.divider}`,
        mt: 8,
        py: [3, 6],
      }}
    >
      <Copyright sx={{ mt: 5 }} />
    </Container>
  );
}
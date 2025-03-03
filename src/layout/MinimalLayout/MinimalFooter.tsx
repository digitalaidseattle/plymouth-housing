/**
 *  MinimalFooter.tsx
 *
 *  @copyright 2024 Digital Aid Seattle
 *
 */

// material-ui
import {
  useMediaQuery,
  Container,
  Link,
  Typography,
  Stack,
  useTheme,
} from '@mui/material';

// ==============================|| FOOTER - AUTHENTICATION ||============================== //

const MinimalFooter = () => {
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Container maxWidth="xl">
      <Stack
        direction={matchDownSM ? 'column' : 'row'}
        justifyContent={matchDownSM ? 'center' : 'space-between'}
        spacing={2}
        textAlign={matchDownSM ? 'center' : 'inherit'}
      >
        <Typography variant="subtitle2" color="secondary" component="span">
          &copy; {import.meta.env.VITE_APPLICATION_NAME}&nbsp;
          <Typography
            component={Link}
            variant="subtitle2"
            href="https://digitalaidseattle.org"
            target="_blank"
            underline="hover"
          >
            Digital Aid Seattle
          </Typography>
        </Typography>

        <Stack
          direction={matchDownSM ? 'column' : 'row'}
          spacing={matchDownSM ? 1 : 3}
          textAlign={matchDownSM ? 'center' : 'inherit'}
        >
        </Stack>
      </Stack>
    </Container>
  );
};

export default MinimalFooter;

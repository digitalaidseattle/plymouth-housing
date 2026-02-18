import { styled } from '@mui/material/styles';
import { CircularProgress } from '@mui/material';

const LoaderWrapper = styled('div')(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  marginTop: '5rem',
}));

const CircularLoader = () => (
  <LoaderWrapper>
    <CircularProgress color="primary" />
  </LoaderWrapper>
);

export default CircularLoader;

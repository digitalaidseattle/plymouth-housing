import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, Stack, Typography, Button, Select, MenuItem, SelectChangeEvent } from '@mui/material';
import MinimalWrapper from '../../layout/MinimalLayout/MinimalWrapper';
import Logo from '../../components/Logo/Logo';
import CenteredCard from '../../layout/MinimalLayout/CenteredCard';

const PickYourNamePage: React.FC = () => {
  const [selectedName, setSelectedName] = useState<string>('');
  const navigate = useNavigate();

  const names = ['Alice', 'Bob', 'Charlie', 'David', 'Eve'];

  const handleNameChange = (event: SelectChangeEvent<string>) => {
    setSelectedName(event.target.value as string);
  };

  const handleNextClick = () => {
    if (selectedName) {
      console.log('Selected Name:', selectedName);
      navigate('/enter-pin');
    } else {
      alert('Please select a name');
    }
  };

  return (
    <MinimalWrapper>
      <Grid
        container
        spacing={0}
        direction="column"
        alignItems="center"
        justifyContent="center"
      >
        <Grid item xs={3}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Logo />
            <Typography variant="h5">{import.meta.env.VITE_APPLICATION_NAME}</Typography>
          </Stack>
        </Grid>
        <CenteredCard>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Stack direction="row" justifyContent="center" alignItems="center" sx={{ mb: { xs: -0.5, sm: 0.5 } }}>
                <Typography variant="h3" textAlign="center">Pick Your Name</Typography>
              </Stack>
            </Grid>
            <Grid item xs={12}>
              <Stack direction="row" justifyContent="center" alignItems="center">
                <Select
                  value={selectedName}
                  onChange={(e) => handleNameChange(e)}
                  displayEmpty
                  sx={{ minWidth: 200 }}
                >
                  <MenuItem value="" disabled>Select a name</MenuItem>
                  {names.map((name) => (
                    <MenuItem key={name} value={name}>
                      {name}
                    </MenuItem>
                  ))}
                </Select>
              </Stack>
            </Grid>
            <Grid item xs={12}>
              <Stack
                direction="row"
                spacing={2}
                justifyContent="center"
                alignItems="center"
                sx={{ mt: 2 }}
              >
                <Button variant="contained" color="primary" onClick={handleNextClick}>
                  Next
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </CenteredCard>
      </Grid>
    </MinimalWrapper>
  );
};

export default PickYourNamePage;
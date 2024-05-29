/**
 * MapPage.tsx
 * Display information of a ticket
 */

// react
import { ReactNode, useEffect, useState } from 'react';

// material-ui
import {
  Box,
  Button,
  Grid,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  Typography
} from '@mui/material';
import {
  FullscreenControl,
  GeolocateControl,
  Marker,
  NavigationControl,
  Popup,
  ScaleControl
} from 'react-map-gl';
import Map from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

import { Location, TeamMember, mappingService } from '../sections/maps/mappingService';

const Labels = {
  title: 'Map Example',
  saveButton: 'Save',
  resetButton: 'Reset',
}

type PopupInfo = {
  location: Location;
  members: TeamMember[];
}

const ICON = `M20.2,15.7L20.2,15.7c1.1-1.6,1.8-3.6,1.8-5.7c0-5.6-4.5-10-10-10S2,4.5,2,10c0,2,0.6,3.9,1.6,5.4c0,0.1,0.1,0.2,0.2,0.3
  c0,0,0.1,0.1,0.1,0.2c0.2,0.3,0.4,0.6,0.7,0.9c2.6,3.1,7.4,7.6,7.4,7.6s4.8-4.5,7.4-7.5c0.2-0.3,0.5-0.6,0.7-0.9
  C20.1,15.8,20.2,15.8,20.2,15.7z`;

const pinStyle = {
  cursor: 'pointer',
  fill: '#0aa',
  stroke: 'none'
};

const DEFAULT_VIEW = {
  longitude: -122.4,
  latitude: 47.6061,
  zoom: 7
}

const MAP_HEIGHT = '80vh';

function Pin({ size = 20 }) {
  return (
    <svg height={size} viewBox="0 0 24 24" style={pinStyle}>
      <path d={ICON} />
    </svg>
  );
}

const MapPage = () => {
  const [viewState, setViewState] = useState(DEFAULT_VIEW);
  const [popupInfo, setPopupInfo] = useState<PopupInfo | null>(null);
  const [people, setPeople] = useState<TeamMember[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [pins, setPins] = useState<ReactNode[]>([]);

  useEffect(() => {
    Promise
      .all([
        mappingService.getPeople(),
        mappingService.getLocations()
      ])
      .then(resps => {
        setPeople(resps[0].sort((p1, p2) => p1.name.localeCompare(p2.name)))
        setLocations(resps[1]);
      });
  }, []);

  useEffect(() => {
    setPins(mappingService
      .unique(locations)
      .map((loc, index) => (
        <Marker
          key={`marker-${index}`}
          longitude={loc.longitude}
          latitude={loc.latitude}
          anchor="bottom"
          onClick={e => {
            // If we let the click event propagates to the map, it will immediately close the popup
            // with `closeOnClick: true`
            e.originalEvent.stopPropagation();
            handleMarkerSelection(loc);
          }}
        >
          <Pin />
        </Marker>
      )))
  }, [locations])

  const handleMarkerSelection = (loc: Location) => {
    const peeps = mappingService.getPeopleAt(people, locations, loc)
    setPopupInfo({
      location: loc,
      members: peeps
    });
  }

  // show that person and center on them
  const handlePeopleSelection = (person: TeamMember) => {
    const loc = locations.find(l => l.name === person.location.trim());
    if (loc) {
      setViewState({
        longitude: loc.longitude,
        latitude: loc.latitude,
        zoom: viewState.zoom
      });
      setPopupInfo({
        location: loc,
        members: [person],
      });
    }
  }

  const reset = () => {
    setViewState(DEFAULT_VIEW);
  }

  const save = () => {
    alert('Save')
  }

  return (
    <Grid container rowSpacing={4.5} columnSpacing={2.75}>
      {/* row 1 */}
      <Grid item xs={12} sx={{ mb: -2.25 }}>
        <Stack direction="row" justifyContent={'space-between'} >
          <Typography variant="h5">{Labels.title}</Typography>
          <Stack direction="row" spacing={'1rem'}>
            <Button
              title={Labels.resetButton}
              variant="contained"
              color="secondary"
              onClick={reset}>
              {Labels.resetButton}
            </Button>
            <Button
              title={Labels.saveButton}
              variant="contained"
              color="primary"
              disabled={true}
              onClick={save}>
              {Labels.saveButton}
            </Button>
          </Stack>
        </Stack>
      </Grid>

      {/* row 2 */}
      <Grid item xs={12} lg={2}>
        <Paper style={{ maxHeight: MAP_HEIGHT, overflow: 'auto' }}>
          <List >
            {people.map((p, idx) =>
              <ListItem key={('p' + idx)}>
                <ListItemButton
                  onClick={() => handlePeopleSelection(p)}>
                  <ListItemText
                    primary={p.name} />
                </ListItemButton>
              </ListItem>
            )}
          </List>
        </Paper>
      </Grid>
      <Grid item xs={12} lg={10}>
        <Box height={MAP_HEIGHT}>
          <Map
            {...viewState}
            onMove={evt => setViewState(evt.viewState)}
            mapStyle={`${import.meta.env.VITE_MAP_STYLE}?key=${import.meta.env.VITE_MAPTILER_API_KEY}`}
          >
            <GeolocateControl position="top-left" />
            <FullscreenControl position="top-left" />
            <NavigationControl position="top-left" />
            <ScaleControl />
            {pins}
            {popupInfo && (
              <Popup
                anchor="top"
                longitude={Number(popupInfo.location.longitude)}
                latitude={Number(popupInfo.location.latitude)}
                onClose={() => setPopupInfo(null)}
              >
                <Stack>
                  <Typography fontWeight={600}>
                    <a target="_new"
                      href={`http://en.wikipedia.org/w/index.php?title=Special:Search&search=${popupInfo.location.name}`}
                    >{popupInfo.location.name}</a>
                  </Typography>

                  {popupInfo.members.length === 1 ?
                    <Stack>
                      <img src={popupInfo.members[0].url} />
                      <Typography fontWeight={600}>{popupInfo.members[0].name}</Typography>
                      <Typography fontWeight={400}>{popupInfo.members[0].role}</Typography>
                    </Stack>
                    :
                    <Typography>Home of {popupInfo.members.length} Cadre members</Typography>
                  }
                </Stack>
              </Popup>
            )}
          </Map>
        </Box>
      </Grid>
    </Grid>
  );
}

export default MapPage;

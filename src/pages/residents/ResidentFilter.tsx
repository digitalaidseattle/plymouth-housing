import React, { useState, useEffect, useContext } from 'react';
import { Box, Button, IconButton, Typography, Menu, MenuItem } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ClearIcon from '@mui/icons-material/Clear';
import SearchBar from '../../components/Searchbar/SearchBar';
import { Building, Unit } from '../../types/interfaces';
import { UserContext } from '../../components/contexts/UserContext';
import { getBuildings, getUnitNumbers } from '../../components/Checkout/CheckoutAPICalls';

interface ResidentFilterProps {
  search: string;
  onSearchChange: (value: string) => void;
  buildingFilter: number | null;
  onBuildingFilterChange: (buildingId: number | null) => void;
  unitFilter: number | null;
  onUnitFilterChange: (unitId: number | null) => void;
}

const ResidentFilter: React.FC<ResidentFilterProps> = ({
  search = '',
  onSearchChange,
  buildingFilter = null,
  onBuildingFilterChange,
  unitFilter = null,
  onUnitFilterChange,
}) => {
  const { user } = useContext(UserContext);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [buildingAnchorEl, setBuildingAnchorEl] = React.useState<null | HTMLElement>(null);
  const [unitAnchorEl, setUnitAnchorEl] = React.useState<null | HTMLElement>(null);

  // Fetch buildings on mount
  useEffect(() => {
    const fetchBuildingsData = async () => {
      try {
        const buildingsData = await getBuildings(user);
        setBuildings(buildingsData);
      } catch (error) {
        console.error('Error fetching buildings:', error);
      }
    };

    fetchBuildingsData();
  }, [user]);

  // Fetch units when building filter changes
  useEffect(() => {
    const fetchUnitsData = async () => {
      if (buildingFilter) {
        try {
          const unitsData = await getUnitNumbers(user, buildingFilter);
          setUnits(unitsData);
        } catch (error) {
          console.error('Error fetching units:', error);
        }
      } else {
        setUnits([]);
      }
    };

    fetchUnitsData();
  }, [buildingFilter, user]);

  // Handle the opening of the building filter menu
  const handleBuildingClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setBuildingAnchorEl(event.currentTarget);
  };

  // Handle the closing of the building filter menu
  const handleBuildingClose = () => {
    setBuildingAnchorEl(null);
  };

  // Clear the building filter value and unit filter
  const clearBuildingFilter = (e: React.MouseEvent) => {
    e.stopPropagation();
    onBuildingFilterChange(null);
    onUnitFilterChange(null); // Clear unit filter when building is cleared
  };

  // Handle the opening of the unit filter menu
  const handleUnitClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setUnitAnchorEl(event.currentTarget);
  };

  // Handle the closing of the unit filter menu
  const handleUnitClose = () => {
    setUnitAnchorEl(null);
  };

  // Clear the unit filter value
  const clearUnitFilter = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUnitFilterChange(null);
  };

  // Get the selected building code for display
  const selectedBuilding = buildings.find(b => b.id === buildingFilter);

  // Get the selected unit number for display
  const selectedUnit = units.find(u => u.id === unitFilter);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', maxWidth: '90%' }}>
      <Typography variant="body2">Filters</Typography>
      <Box sx={{ px: '8px' }}>
        <Button
          aria-label="Building Filter"
          aria-haspopup="true"
          sx={{ color: 'black', bgcolor: '#E0E0E0', height: '30px' }}
          onClick={handleBuildingClick}
        >
          {buildingFilter && selectedBuilding ? (
            <>
              {selectedBuilding.code}
              <IconButton
                aria-label="Clear Building Filter"
                onClick={clearBuildingFilter}
                size="small"
                sx={{ padding: 0, color: 'black', ml: '6px' }}
              >
                <ClearIcon sx={{ fontSize: 'large' }} />
              </IconButton>
            </>
          ) : (
            <>
              <Typography variant="body2">Building</Typography>
              <ExpandMoreIcon sx={{ fontSize: 'large', ml: '6px' }} />
            </>
          )}
        </Button>
        <Menu
          open={Boolean(buildingAnchorEl)}
          onClose={handleBuildingClose}
          anchorEl={buildingAnchorEl}
        >
          {buildings.map((building) => (
            <MenuItem
              key={building.id}
              onClick={() => {
                onBuildingFilterChange(building.id);
                onUnitFilterChange(null); // Clear unit filter when changing building
                handleBuildingClose();
              }}
            >
              {building.code} - {building.name}
            </MenuItem>
          ))}
        </Menu>
      </Box>
      <Box sx={{ px: '8px' }}>
        <Button
          aria-label="Unit Filter"
          aria-haspopup="true"
          sx={{ color: 'black', bgcolor: '#E0E0E0', height: '30px' }}
          onClick={handleUnitClick}
          disabled={units.length === 0}
        >
          {unitFilter && selectedUnit ? (
            <>
              Unit {selectedUnit.unit_number}
              <IconButton
                aria-label="Clear Unit Filter"
                onClick={clearUnitFilter}
                size="small"
                sx={{ padding: 0, color: 'black', ml: '6px' }}
              >
                <ClearIcon sx={{ fontSize: 'large' }} />
              </IconButton>
            </>
          ) : (
            <>
              <Typography variant="body2">Unit</Typography>
              <ExpandMoreIcon sx={{ fontSize: 'large', ml: '6px' }} />
            </>
          )}
        </Button>
        <Menu
          open={Boolean(unitAnchorEl)}
          onClose={handleUnitClose}
          anchorEl={unitAnchorEl}
        >
          {units.map((unit) => (
            <MenuItem
              key={unit.id}
              onClick={() => {
                onUnitFilterChange(unit.id);
                handleUnitClose();
              }}
            >
              Unit {unit.unit_number}
            </MenuItem>
          ))}
        </Menu>
      </Box>
      <Box sx={{ ml: 'auto' }}>
        <SearchBar
          searchValue={search}
          onSearchChange={onSearchChange}
          placeholder="Search residents..."
          width="100%"
        />
      </Box>
    </Box>
  );
};

export default ResidentFilter;

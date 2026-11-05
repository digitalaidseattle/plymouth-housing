/**
 *  BuildingFilterSelect.tsx
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import React from 'react';
import {
  FormControl,
  InputLabel,
  ListSubheader,
  MenuItem,
  Select,
  SxProps,
  Theme,
} from '@mui/material';
import { Building } from '../types/interfaces';
import { isVoucherBuilding } from '../utils/buildingUtils';

type BuildingFilterSelectProps = {
  buildings: Building[] | null;
  value: number | 'all' | '';
  onChange: (buildingId: number | 'all') => void;
  labelId: string;
  id?: string;
  includeAll?: boolean;
  formControlSx?: SxProps<Theme>;
  sx?: SxProps<Theme>;
};

const BuildingFilterSelect: React.FC<BuildingFilterSelectProps> = ({
  buildings,
  value,
  onChange,
  labelId,
  id,
  includeAll = false,
  formControlSx,
  sx,
}) => (
  <FormControl sx={formControlSx}>
    <InputLabel id={labelId}>Building</InputLabel>
    <Select
      labelId={labelId}
      id={id}
      value={value}
      label="Building"
      onChange={(event) => {
        const selected = event.target.value;
        onChange(selected === 'all' ? 'all' : Number(selected));
      }}
      sx={sx}
    >
      {includeAll && <MenuItem value="all">All Buildings</MenuItem>}
      {buildings
        ?.filter((building) => !isVoucherBuilding(building.code))
        .map((building) => (
          <MenuItem key={building.id} value={building.id}>
            {building.code} — {building.name}
          </MenuItem>
        ))}
      {buildings?.some((building) => isVoucherBuilding(building.code)) && (
        <ListSubheader>Voucher Programs</ListSubheader>
      )}
      {buildings
        ?.filter((building) => isVoucherBuilding(building.code))
        .map((building) => (
          <MenuItem key={building.id} value={building.id}>
            {building.code} — {building.name}
          </MenuItem>
        ))}
    </Select>
  </FormControl>
);

export default BuildingFilterSelect;

import React, { FormEvent, useState, useContext } from 'react';
import { Box, FormControl, TextField, Typography, Chip, Button, useTheme } from '@mui/material';
import BuildingCodeSelect from './BuildingCodeSelect';
import {
  Building,
  ResidentInfo,
  Unit,
  ResidentNameOption,
  ResidentFormError,
} from '../../types/interfaces';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import DialogTemplate from '../DialogTemplate';
import { UserContext } from '../contexts/UserContext.ts';
import { useUnitNumbers } from './hooks/useUnitNumbers';
import { useResidents } from './hooks/useResidents';
import { useResidentFormSubmit } from './hooks/useResidentFormSubmit';

type ResidentDetailDialogProps = {
  showDialog: boolean;
  handleShowDialog: () => void;
  buildings: Building[];
  unitNumberValues: Unit[];
  setUnitNumberValues: React.Dispatch<React.SetStateAction<Unit[]>>;
  residentInfo: ResidentInfo;
  setResidentInfo: React.Dispatch<React.SetStateAction<ResidentInfo>>;
  isEditMode?: boolean;
  onCancelEdits?: () => void;
};

const ResidentDetailDialog = ({
  showDialog,
  handleShowDialog,
  buildings,
  unitNumberValues,
  setUnitNumberValues,
  residentInfo,
  setResidentInfo,
  isEditMode = false,
  onCancelEdits,
}: ResidentDetailDialogProps) => {
  const theme = useTheme();
  const { user } = useContext(UserContext);
  const [selectedBuilding, setSelectedBuilding] = useState<Building>(
    residentInfo.building,
  );
  const [selectedUnit, setSelectedUnit] = useState<Unit>(residentInfo.unit);
  const [formError, setFormError] = useState<ResidentFormError>({
    buildingError: false,
    unitError: false,
    nameError: false,
  });

  const residentNameFilter = createFilterOptions<ResidentNameOption>({
    matchFrom: 'start',
  });

  const unitNumberFilter = createFilterOptions<Unit>({
    matchFrom: 'start',
  });

  const unitNumbersHook = useUnitNumbers(setSelectedUnit);
  const residentsHook = useResidents(user, selectedUnit, residentInfo.name, residentInfo.lastVisitDate, isEditMode);
  const submitHook = useResidentFormSubmit(user, (residentInfo) => {
    setResidentInfo(residentInfo);
    handleShowDialog();
  });

  const isWaiting =
    submitHook.isSubmitting ||
    unitNumbersHook.isLoadingUnits ||
    residentsHook.isLoadingResidents;
  const apiError =
    unitNumbersHook.apiError || residentsHook.apiError || submitHook.apiError;

  function formatVisitDate(
    dateStr: string | null,
    fallback: string = 'No previous visits',
  ): string {
    if (!dateStr) return fallback;
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return fallback;
    return date.toLocaleDateString();
  }

  function isDateInCurrentMonth(dateStr: string | null): boolean {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return false;
    const now = new Date();
    return (
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );
  }

  const fetchUnitNumbers = async (buildingId: number) => {
    await unitNumbersHook.fetchUnitNumbers(user, buildingId);
  };

  React.useEffect(() => {
    setUnitNumberValues(unitNumbersHook.unitNumberValues);
  }, [unitNumbersHook.unitNumberValues, setUnitNumberValues]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (isEditMode) {
      handleShowDialog();
      return;
    }

    unitNumbersHook.setApiError('');
    residentsHook.setApiError('');
    await submitHook.handleSubmit(
      residentsHook.nameInput,
      selectedBuilding,
      selectedUnit,
      setFormError,
      residentsHook.currentLastVisitDate,
    );
  }

  return (
    <DialogTemplate
      showDialog={showDialog}
      handleShowDialog={handleShowDialog}
      handleSubmit={handleSubmit}
      title="provide details to continue"
      submitButtonText="continue"
      isSubmitting={isWaiting}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          paddingY: '1rem',
        }}
      >
        {isEditMode && (
          <Chip
            size="small"
            variant="outlined"
            sx={{
              alignSelf: 'flex-start',
              color: theme.palette.text.secondary,
              borderColor: theme.palette.grey[300],
              backgroundColor: 'transparent',
            }}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box component="span">Editing transaction</Box>
                <Button size="small" variant="text" color="primary" id="edit-mode-dialog-cancel-btn" onClick={onCancelEdits}>
                  Cancel
                </Button>
              </Box>
            }
          />
        )}
        <FormControl>
          <BuildingCodeSelect
            buildings={buildings}
            selectedBuilding={selectedBuilding}
            setSelectedBuilding={setSelectedBuilding}
            setSelectedUnit={setSelectedUnit}
            fetchUnitNumbers={fetchUnitNumbers}
            error={formError.buildingError}
            resetError={() =>
              setFormError({
                buildingError: false,
                unitError: false,
                nameError: false,
              })
            }
            disabled={isWaiting || isEditMode}
          />
        </FormControl>

        <FormControl>
          <Autocomplete
            id="select-unit-number"
            data-testid="test-id-select-unit-number"
            options={unitNumberValues}
            value={selectedUnit}
            disabled={isWaiting || isEditMode}
            filterOptions={unitNumberFilter}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            onInputChange={(_event: React.SyntheticEvent, newValue, reason) => {
              if (reason === 'clear') {
                setSelectedUnit({ id: 0, unit_number: '' });
                return;
              }
              const matchingUnit = unitNumberValues.find(
                (u) => u.unit_number === newValue,
              );
              if (matchingUnit) {
                setSelectedUnit(matchingUnit);
                setFormError({
                  ...formError,
                  unitError: false,
                  nameError: false,
                });
              } else {
                setSelectedUnit({ id: 0, unit_number: newValue });
              }
            }}
            getOptionLabel={(option: Unit | string) => {
              if (typeof option === 'string') return option;
              return `${option.unit_number}`;
            }}
            renderInput={(params) => {
              return (
                <TextField
                  {...params}
                  id={selectedUnit.unit_number}
                  label="Unit Number"
                  error={formError.unitError}
                  helperText={
                    formError.unitError
                      ? 'Please select a unit from the list'
                      : ''
                  }
                />
              );
            }}
            freeSolo
          />
        </FormControl>

        <FormControl>
          <Autocomplete
            value={residentsHook.nameInput}
            disabled={isWaiting || isEditMode}
            onChange={(_event, newValue) => {
              if (formError.nameError) {
                setFormError({ ...formError, nameError: false });
              }
              if (typeof newValue === 'string') {
                residentsHook.setNameInput(newValue);
                residentsHook.setCurrentLastVisitDate(null);
              } else if (
                newValue &&
                (newValue as ResidentNameOption).inputValue
              ) {
                residentsHook.setNameInput(
                  (newValue as ResidentNameOption).inputValue!,
                );
                residentsHook.setCurrentLastVisitDate(null);
              } else if (newValue && (newValue as ResidentNameOption).name) {
                const selectedResident = newValue as ResidentNameOption;
                residentsHook.setNameInput(selectedResident.name);
                residentsHook.setCurrentLastVisitDate(
                  selectedResident.lastVisitDate || null,
                );
              } else {
                residentsHook.setNameInput('');
                residentsHook.setCurrentLastVisitDate(null);
              }
            }}
            onInputChange={(_event, newInputValue, reason) => {
              if (formError.nameError) {
                setFormError({ ...formError, nameError: false });
              }
              if (reason === 'input') {
                residentsHook.setNameInput(newInputValue);
                residentsHook.setCurrentLastVisitDate(null);
              }
            }}
            filterOptions={(options, params) => {
              const filtered = residentNameFilter(options, params);
              return filtered;
            }}
            selectOnFocus
            handleHomeEndKeys
            id="resident-name-autocomplete"
            options={residentsHook.existingResidents}
            getOptionLabel={(option) => {
              if (typeof option === 'string') {
                return option;
              }
              if (option.inputValue) {
                return option.inputValue;
              }
              return option.name;
            }}
            renderOption={(props, option) => {
              const { key, ...optionProps } = props;
              const lastVisit = formatVisitDate(option.lastVisitDate || null);

              return (
                <li key={key} {...optionProps}>
                  {option.name} - Last visit: {lastVisit}
                </li>
              );
            }}
            freeSolo
            renderInput={(params) => (
              <TextField
                {...params}
                label="Resident Name"
                error={formError.nameError}
                helperText={
                  formError.nameError
                    ? 'Please enter the name of the resident'
                    : ''
                }
              />
            )}
          />
        </FormControl>
        {residentsHook.nameInput && (
          <Typography
            variant="h5"
            color={
              isDateInCurrentMonth(residentsHook.currentLastVisitDate)
                ? 'error'
                : 'text.secondary'
            }
            sx={{ alignSelf: 'flex-start' }}
          >
            last visit:{' '}
            {formatVisitDate(residentsHook.currentLastVisitDate, 'none')}
          </Typography>
        )}
        {apiError && <Typography color="error">{apiError}</Typography>}
      </Box>
    </DialogTemplate>
  );
};

export default ResidentDetailDialog;

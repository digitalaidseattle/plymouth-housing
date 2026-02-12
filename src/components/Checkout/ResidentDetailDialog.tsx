import React, { FormEvent, useState, useContext } from 'react';
import { Box, FormControl, TextField, Typography } from '@mui/material';
import BuildingCodeSelect from './BuildingCodeSelect';
import { Building, ResidentInfo, Unit, ResidentNameOption } from '../../types/interfaces';
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
};

const ResidentDetailDialog = ({
  showDialog,
  handleShowDialog,
  buildings,
  unitNumberValues,
  setUnitNumberValues,
  residentInfo,
  setResidentInfo,
}: ResidentDetailDialogProps) => {
  const { user } = useContext(UserContext);
  const [selectedBuilding, setSelectedBuilding] = useState<Building>(
    residentInfo.building,
  );
  const [selectedUnit, setSelectedUnit] = useState<Unit>(residentInfo.unit);
  const [showError, setShowError] = useState<boolean>(false);

  const filter = createFilterOptions<ResidentNameOption>();

  const unitNumbersHook = useUnitNumbers(setSelectedUnit);
  const residentsHook = useResidents(user, selectedUnit);
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
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }

  const fetchUnitNumbers = async (buildingId: number) => {
    await unitNumbersHook.fetchUnitNumbers(user, buildingId);
  };

  React.useEffect(() => {
    if (unitNumbersHook.unitNumberValues.length > 0) {
      setUnitNumberValues(unitNumbersHook.unitNumberValues);
    }
  }, [unitNumbersHook.unitNumberValues, setUnitNumberValues]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    unitNumbersHook.setApiError('');
    residentsHook.setApiError('');
    await submitHook.handleSubmit(
      residentsHook.nameInput,
      selectedBuilding,
      selectedUnit,
      showError,
      setShowError,
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
        <FormControl>
          <BuildingCodeSelect
            buildings={buildings}
            selectedBuilding={selectedBuilding}
            setSelectedBuilding={setSelectedBuilding}
            setSelectedUnit={setSelectedUnit}
            fetchUnitNumbers={fetchUnitNumbers}
            error={showError && !selectedBuilding.id}
            disabled={isWaiting}
          />
        </FormControl>

        <FormControl>
          <Autocomplete
            id="select-unit-number"
            data-testid="test-id-select-unit-number"
            options={unitNumberValues}
            value={selectedUnit}
            disabled={isWaiting}
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
                setShowError(false);
              } else {
                setSelectedUnit({ id: 0, unit_number: newValue });
                setShowError(true);
              }
            }}
            getOptionLabel={(option: Unit | string) => {
              if (typeof option === 'string') return option;
              return `${option.unit_number}`;
            }}
            renderInput={(params) => {
              const getHelperText = () => {
                if (!showError) return '';
                if (selectedUnit.id === 0 && selectedUnit.unit_number) return 'Not a valid unit';
                if (selectedUnit.id === 0) return 'Please select a unit from the list';
                return '';
              };

              return (
                <TextField
                  {...params}
                  id={selectedUnit.unit_number}
                  label="Unit Number"
                  error={showError}
                  helperText={getHelperText()}
                />
              );
            }}
            freeSolo
          />
        </FormControl>

        <FormControl>
          <Autocomplete
            value={residentsHook.nameInput}
            disabled={isWaiting}
            onChange={(_event, newValue) => {
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
              if (reason === 'input') {
                residentsHook.setNameInput(newInputValue);
                residentsHook.setCurrentLastVisitDate(null);
              }
            }}
            filterOptions={(options, params) => {
              const filtered = filter(options, params);
              return filtered;
            }}
            selectOnFocus
            clearOnBlur
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
                error={showError && !residentsHook.nameInput}
                helperText={
                  showError && !residentsHook.nameInput
                    ? "Please enter the resident's name"
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
            last visit: {formatVisitDate(residentsHook.currentLastVisitDate, 'none')}
          </Typography>
        )}
        {apiError && <Typography color="error">{apiError}</Typography>}
      </Box>
    </DialogTemplate>
  );
};

export default ResidentDetailDialog;

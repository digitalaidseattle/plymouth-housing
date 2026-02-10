import React, { FormEvent, useState, useContext } from 'react';
import {
  Box,
  FormControl,
  TextField,
  Typography,
} from '@mui/material';
import BuildingCodeSelect from './BuildingCodeSelect';
import { Building, ResidentInfo, Unit } from '../../types/interfaces';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import DialogTemplate from '../DialogTemplate';
import { UserContext } from '../contexts/UserContext.ts';
import { ResidentNameOption, getUnitHelperText } from './residentFormHelpers';
import { useUnitNumbers } from './hooks/useUnitNumbers';
import { useResidents } from './hooks/useResidents';
import { useResidentFormSubmit } from './hooks/useResidentFormSubmit';


type ResidentDetailDialogProps = {
    showDialog: boolean,
    handleShowDialog: () => void,
    buildings: Building[],
    unitNumberValues: Unit[],
    setUnitNumberValues:  React.Dispatch<React.SetStateAction<Unit[]>>,
    residentInfo: ResidentInfo,
    setResidentInfo: React.Dispatch<React.SetStateAction<ResidentInfo>>,
    checkoutType?: 'general' | 'welcomeBasket'
}

// =============================================================================
// RESIDENT DETAIL DIALOG
//
// Dual Purpose Component:
// 1. General Mode: Collects building + unit + resident for individual checkout
// 2. Welcome Basket Mode: Collects only building, auto-selects 'welcome' unit
//    and 'admin' resident for building-level welcome basket checkout
// =============================================================================

const ResidentDetailDialog = ({
    showDialog,
    handleShowDialog,
    buildings,
    unitNumberValues,
    setUnitNumberValues,
    residentInfo,
    setResidentInfo,
    checkoutType = 'general'
    }: ResidentDetailDialogProps) => {
    const {user} = useContext(UserContext);
    const [selectedBuilding, setSelectedBuilding] = useState<Building>(residentInfo.building)
    const [selectedUnit, setSelectedUnit] = useState<Unit>(residentInfo.unit);
    const [showError, setShowError] = useState<boolean>(false);

    const filter = createFilterOptions<ResidentNameOption>();

    // Custom hooks for data fetching and state management
    const unitNumbersHook = useUnitNumbers(checkoutType, setSelectedUnit);
    const residentsHook = useResidents(user, selectedUnit, checkoutType);
    const submitHook = useResidentFormSubmit(
        checkoutType,
        user,
        (residentInfo) => {
            setResidentInfo(residentInfo);
            handleShowDialog();
        }
    );

    // Combine loading states
    const isWaiting = submitHook.isSubmitting || unitNumbersHook.isLoadingUnits || residentsHook.isLoadingResidents;

    // Combine API errors from different hooks
    const apiError = unitNumbersHook.apiError || residentsHook.apiError || submitHook.apiError;

    // Wrapper for fetchUnitNumbers that also updates parent state
    const fetchUnitNumbers = async (buildingId: number) => {
        await unitNumbersHook.fetchUnitNumbers(user, buildingId);
    };

    // Sync hook's unit numbers with parent state
    React.useEffect(() => {
        if (unitNumbersHook.unitNumberValues.length > 0) {
            setUnitNumberValues(unitNumbersHook.unitNumberValues);
        }
    }, [unitNumbersHook.unitNumberValues, setUnitNumberValues]);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        // Clear all API errors from all hooks before submission
        unitNumbersHook.setApiError('');
        residentsHook.setApiError('');
        await submitHook.handleSubmit(
            residentsHook.nameInput,
            selectedBuilding,
            selectedUnit,
            showError,
            setShowError
        );
        // submitHook handles closing dialog on success via callback
    }

    return (
        <DialogTemplate
            showDialog={showDialog}
            handleShowDialog={handleShowDialog}
            handleSubmit={handleSubmit}
            title={checkoutType === 'welcomeBasket' ? 'provide building code to continue' : 'provide details to continue'}
            submitButtonText='continue'
            isSubmitting={isWaiting}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingY: '1rem' }}>
                <FormControl>
                    <BuildingCodeSelect
                        buildings={buildings}
                        selectedBuilding={selectedBuilding}
                        setSelectedBuilding={setSelectedBuilding}
                        setSelectedUnit={setSelectedUnit}
                        fetchUnitNumbers={fetchUnitNumbers}
                        error={showError && !selectedBuilding.id}
                        disabled={isWaiting}/>
                </FormControl>

                {checkoutType === 'general' && (
                    <FormControl>
                        <Autocomplete
                            id="select-unit-number"
                            data-testid="test-id-select-unit-number"
                            options={unitNumberValues}
                            value={selectedUnit}
                            disabled={isWaiting}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            onInputChange={(_event: React.SyntheticEvent, newValue, reason) => {
                                if (reason === "clear") {
                                    setSelectedUnit({id: 0, unit_number: ''});
                                    return;
                                }
                                // runs whether value was selected or typed; matches value with corresponding unit object
                                const matchingUnit = unitNumberValues.find(u => u.unit_number === newValue);
                                if (matchingUnit) {
                                    setSelectedUnit(matchingUnit)
                                    setShowError(false)
                                } else {
                                    setSelectedUnit({id: 0, unit_number: newValue})
                                    setShowError(true)
                                }
                            }}
                            getOptionLabel={(option: Unit | string) => {
                                if (typeof option === 'string') return option;
                                return `${option.unit_number}`;
                            }}
                            renderInput={(params) =>
                                <TextField {...params}
                                    id={selectedUnit.unit_number}
                                    label="Unit Number"
                                    error={showError}
                                    helperText={getUnitHelperText(showError, selectedUnit)}
                                />
                            }
                            freeSolo
                        />
                    </FormControl>
                )}

                {checkoutType === 'general' && (
                    <FormControl>
                        <Autocomplete
                            value={residentsHook.nameInput}
                            disabled={isWaiting}
                            onChange={(_event, newValue) => {
                                if (typeof newValue === 'string') {
                                    residentsHook.setNameInput(newValue);
                                } else if (newValue && (newValue as ResidentNameOption).inputValue) {
                                    residentsHook.setNameInput((newValue as ResidentNameOption).inputValue!);
                                } else if (newValue && (newValue as ResidentNameOption).name) {
                                    residentsHook.setNameInput((newValue as ResidentNameOption).name);
                                } else {
                                    residentsHook.setNameInput('');
                                }
                            }}
                            filterOptions={(options, params) => {
                                const filtered = filter(options, params);
                                const { inputValue } = params;
                                // Suggest the creation of a new value
                                const isExisting = options.some((option) => inputValue === option.name);
                                if (inputValue !== '' && !isExisting) {
                                    residentsHook.setNameInput(inputValue);
                                }
                                return filtered;
                            }}
                            selectOnFocus
                            clearOnBlur
                            handleHomeEndKeys
                            id="resident-name-autocomplete"
                            options={residentsHook.existingResidents}
                            getOptionLabel={(option) => {
                            // Value selected with enter, right from the input
                            if (typeof option === 'string') {
                                return option;
                            }
                            // Add "xxx" option created dynamically
                            if (option.inputValue) {
                                return option.inputValue;
                            }
                            // Regular option
                            return option.name;
                            }}
                            renderOption={(props, option) => {
                            const { key, ...optionProps } = props;
                            return (
                                <li key={key} {...optionProps}>
                                {option.name}
                                </li>
                                );
                            }}
                            freeSolo
                            renderInput={(params) => (
                            <TextField {...params}
                                label="Resident Name"
                                error={showError && !residentsHook.nameInput}
                                helperText={showError && !residentsHook.nameInput ? "Please enter the resident's name" : ""}/>
                            )}
                        />
                    </FormControl>
                )}
                {apiError && <Typography color="error">{apiError}</Typography>}
            </Box>
        </DialogTemplate>
    );
}

export default ResidentDetailDialog;
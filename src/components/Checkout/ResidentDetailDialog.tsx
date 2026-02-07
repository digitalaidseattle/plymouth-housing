import React, { FormEvent, useEffect, useState, useContext } from 'react';
import {
  Box,
  FormControl,
  TextField,
  Typography,
} from '@mui/material';
import BuildingCodeSelect from './BuildingCodeSelect';
import { Building, ResidentInfo, Unit } from '../../types/interfaces';
import { addResident, findResident, getResidents, getUnitNumbers } from './CheckoutAPICalls';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import DialogTemplate from '../DialogTemplate';
import { UserContext } from '../contexts/UserContext.ts';


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

type ResidentNameOption = {
    inputValue?: string;
    name: string;
}

// =============================================================================
// RESIDENT DETAIL DIALOG
//
// Dual Purpose Component:
// 1. General Mode: Collects building + unit + resident for individual checkout
// 2. Welcome Basket Mode: Collects only building, auto-selects 'welcome' unit
//    and 'admin' resident for building-level welcome basket checkout
// =============================================================================

// Helper: Validate form based on checkout mode
const validateResidentForm = (
    checkoutType: 'general' | 'welcomeBasket',
    selectedBuilding: Building,
    selectedUnit: Unit,
    nameInput: string
): boolean => {
    if (checkoutType === 'welcomeBasket') {
        return !!selectedBuilding.id && !!selectedUnit.id;
    }
    return !!nameInput && !!selectedBuilding.id && !!selectedUnit.id;
};

// Helper: Get default resident name based on mode
const getDefaultResidentName = (
    checkoutType: 'general' | 'welcomeBasket',
    residents: ResidentNameOption[]
): string => {
    if (checkoutType === 'welcomeBasket') {
        const adminResident = residents.find(r => r.name.toLowerCase() === 'admin');
        return adminResident?.name || 'admin';
    }
    return residents.length > 0 ? residents[residents.length - 1].name : '';
};

// Helper: Auto-select welcome unit for Welcome Basket mode
const applyWelcomeBasketDefaults = (
    checkoutType: 'general' | 'welcomeBasket',
    unitNumbers: Unit[],
    setSelectedUnit: (unit: Unit) => void
): void => {
    if (checkoutType !== 'welcomeBasket') return;

    const welcomeUnit = unitNumbers.find(u => u.unit_number.toLowerCase() === 'welcome');
    if (welcomeUnit) {
        setSelectedUnit(welcomeUnit);
    }
};

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
    const [nameInput, setNameInput] = useState<string>(residentInfo.name)
    const [selectedBuilding, setSelectedBuilding] = useState<Building>(residentInfo.building)
    const [selectedUnit, setSelectedUnit] = useState<Unit>(residentInfo.unit);
    const [existingResidents, setExistingResidents] = useState<ResidentNameOption[]>([]);
    const [showError, setShowError] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingResidents, setIsLoadingResidents] = useState(false);
    const [isLoadingUnits, setIsLoadingUnits] = useState(false);
    const [apiError, setApiError] = useState('');

    const filter = createFilterOptions<ResidentNameOption>();

    const isWaiting = isSubmitting || isLoadingUnits || isLoadingResidents;

    const fetchUnitNumbers = async (buildingId: number) => {
        setIsLoadingUnits(true);
        setApiError('');
        document.body.style.cursor = 'wait';
        try {
            const response = await getUnitNumbers(user, buildingId);
            const unitNumbers = response
                .filter((item: Unit) => item.unit_number.trim() !== '');
            setUnitNumberValues(unitNumbers);

            // Auto-select 'welcome' unit for Welcome Basket mode
            applyWelcomeBasketDefaults(checkoutType, unitNumbers, setSelectedUnit);

            // Validate that a welcome unit exists in Welcome Basket mode
            if (checkoutType === 'welcomeBasket') {
                const welcomeUnit = unitNumbers.find((u: Unit) => u.unit_number.toLowerCase() === 'welcome');
                if (!welcomeUnit) {
                    setApiError('No welcome unit found for this building. Please contact an administrator.');
                }
            }
        } catch (error) {
            console.error('Error fetching unit numbers:', error);
            setUnitNumberValues([]);
            if (error instanceof TypeError && error.message === 'Failed to fetch') {
                setApiError('Unable to load unit numbers. Please check your connection and try again.');
            } else {
                setApiError('An error occurred while loading unit numbers. Please try again.');
            }
        } finally {
            setIsLoadingUnits(false);
            document.body.style.cursor = 'default';
        }
    }

    useEffect(() => {
        let cancelled = false;
        const fetchResidents = async () => {
            if (!selectedUnit?.id) {
                setExistingResidents([]);
                setNameInput('');
                setIsLoadingResidents(false);
                setApiError('');
                return;
            }
            setIsLoadingResidents(true);
            setApiError('');
            document.body.style.cursor = 'wait';
            try {
                const response = await getResidents(user, selectedUnit.id);
                if (cancelled) return;
                if (response.value.length > 0) {
                    const residents = response.value.map((r: { name: string }) => ({ name: r.name }));
                    setExistingResidents(residents);
                    setNameInput(getDefaultResidentName(checkoutType, residents));
                } else {
                    setExistingResidents([]);
                    setNameInput(getDefaultResidentName(checkoutType, []));
                }
            } catch (e) {
                if (cancelled) return;
                console.error('Error fetching residents:', e);
                setExistingResidents([]);
                setNameInput(getDefaultResidentName(checkoutType, []));
                if (e instanceof TypeError && e.message === 'Failed to fetch') {
                    setApiError('Unable to load resident data. Please check your connection and try again.');
                } else {
                    setApiError('An error occurred while loading resident data. Please try again.');
                }
            } finally {
                if (!cancelled) {
                    setIsLoadingResidents(false);
                    document.body.style.cursor = 'default';
                }
            }
        };
        fetchResidents();
        return () => { cancelled = true; };
    }, [user, selectedUnit, checkoutType]);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setApiError('');
        // validate inputs, show error
        if (!validateResidentForm(checkoutType, selectedBuilding, selectedUnit, nameInput)) {
            setShowError(true);
            return;
        }
        setIsSubmitting(true);
        document.body.style.cursor = 'wait';
        try {
            let residentId;
            // first check if the resident already exists
            const existingResponse = await findResident(user, nameInput, selectedUnit.id);
            // if not, add them to the db
            if (!existingResponse.value.length) {
                const response = await addResident(user, nameInput, selectedUnit.id);
                residentId = response.value[0].id;
             } else {
                residentId = existingResponse.value[0].id;
             }

            // update state on success
            setResidentInfo({
                id: residentId,
                name: nameInput,
                unit: selectedUnit,
                building: selectedBuilding
            });
            setShowError(false);
            handleShowDialog();
        } catch (error) {
            console.error('Error submitting resident info', error);
            if (error instanceof TypeError && error.message === 'Failed to fetch') {
                setApiError('Your system appears to be offline. Please check your connection and try again.');
            } else {
                setApiError('An error occurred while submitting. Please try again.');
            }
            setIsSubmitting(false);
        } finally {
            document.body.style.cursor = 'default';
        }
    }

    function getUnitHelperText(showError: boolean, selectedUnit: Unit) {
        if (!showError) return "";
        if (selectedUnit.id === 0 && selectedUnit.unit_number) return "Not a valid unit";
        if (selectedUnit.id === 0) return "Please select a unit from the list";
        return "";
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
                            value={nameInput}
                            disabled={isWaiting}
                            onChange={(_event, newValue) => {
                                if (typeof newValue === 'string') {
                                    setNameInput(newValue);
                                } else if (newValue && (newValue as ResidentNameOption).inputValue) {
                                    setNameInput((newValue as ResidentNameOption).inputValue!);
                                } else if (newValue && (newValue as ResidentNameOption).name) {
                                    setNameInput((newValue as ResidentNameOption).name);
                                } else {
                                    setNameInput('');
                                }
                            }}
                            filterOptions={(options, params) => {
                                const filtered = filter(options, params);
                                const { inputValue } = params;
                                // Suggest the creation of a new value
                                const isExisting = options.some((option) => inputValue === option.name);
                                if (inputValue !== '' && !isExisting) {
                                    setNameInput(inputValue);
                                }
                                return filtered;
                            }}
                            selectOnFocus
                            clearOnBlur
                            handleHomeEndKeys
                            id="resident-name-autocomplete"
                            options={existingResidents}
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
                                error={showError && !nameInput}
                                helperText={showError && !nameInput ? "Please enter the resident's name" : ""}/>
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
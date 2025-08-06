import React, { FormEvent, useEffect, useState } from 'react';
import {
  Box,
  FormControl,
  TextField,
} from '@mui/material';
import BuildingCodeSelect from './BuildingCodeSelect';
import { Building, ResidentInfo, Unit } from '../../types/interfaces';
import { addResident, findResident, getResidents, getUnitNumbers } from './CheckoutAPICalls';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import DialogTemplate from './DialogTemplate';

type ResidentDetailDialogProps = {
    showDialog: boolean,
    handleShowDialog: () => void,
    buildings: Building[],
    unitNumberValues: Unit[],
    setUnitNumberValues:  React.Dispatch<React.SetStateAction<Unit[]>>,
    residentInfo: ResidentInfo,
    setResidentInfo: React.Dispatch<React.SetStateAction<ResidentInfo>>
}

type ResidentNameOption = {
    inputValue?: string;
    name: string;
}

const ResidentDetailDialog = ({
    showDialog, 
    handleShowDialog, 
    buildings, 
    unitNumberValues,
    setUnitNumberValues,
    residentInfo,
    setResidentInfo
    }: ResidentDetailDialogProps) => {

    const [nameInput, setNameInput] = useState<string>(residentInfo.name)
    const [selectedBuilding, setSelectedBuilding] = useState<Building>(residentInfo.building)
    const [selectedUnit, setSelectedUnit] = useState<Unit>(residentInfo.unit);

    const [existingResidents, setExistingResidents] = useState<ResidentNameOption[]>([]);

    const [showError, setShowError] = useState<boolean>(false);

    const filter = createFilterOptions<ResidentNameOption>();

    const fetchUnitNumbers = async (buildingId: number) => {
        const response = await getUnitNumbers(buildingId);
        // populate unit code dropdown
        const unitNumbers = response.value
            .filter((item: Unit) => item.unit_number.trim() !== '');
        setUnitNumberValues(unitNumbers);
    }

    useEffect(() => {
        const fetchResidents = async () => {
            const response = await getResidents(selectedUnit.id);
            if (response.value.length > 0) {
                setExistingResidents(response.value.map((resident: ResidentNameOption) => ({ name: resident.name })));
            } else {
                setExistingResidents([]);
            }
        }
        fetchResidents();
    }, [selectedUnit, selectedBuilding])

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        // validate inputs, show error
        if (!nameInput || !selectedBuilding.id || !selectedUnit.id) {
            setShowError(true);
            return;
        }
        let residentId;
        // try submitting to db
        try {
            // first check if the resident already exists
            const existingResponse = await findResident(nameInput, selectedUnit.id);
            // if not, add them to the db
            if (!existingResponse.value.length) { 
                const response = await addResident(nameInput, selectedUnit.id);
                residentId = response.value[0].id;
             } else {
                residentId = existingResponse.value[0].id;
             }
        } catch (error) {
            console.error('Error submitting resident info', error);
            return;
        } finally {
            // update state
            setResidentInfo({
                id: residentId,
                name: nameInput,
                unit: selectedUnit,
                building: selectedBuilding
            })
            setShowError(false);
            handleShowDialog();
        }
    }

    return (
        <DialogTemplate 
            showDialog={showDialog} 
            handleShowDialog={handleShowDialog} 
            handleSubmit={handleSubmit}
            title="provide details to continue"
            submitButtonText='continue'>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingY: '1rem' }}>
                <FormControl>
                    <BuildingCodeSelect 
                        buildings={buildings} 
                        selectedBuilding={selectedBuilding} 
                        setSelectedBuilding={setSelectedBuilding} 
                        setSelectedUnit={setSelectedUnit}
                        setNameInput={setNameInput}
                        fetchUnitNumbers={fetchUnitNumbers}
                        error={showError && !selectedBuilding.id}/>
                </FormControl>

                {unitNumberValues.length > 1 && 
                <FormControl>
                    <Autocomplete
                        id="select-unit-number"
                        data-testid="test-id-select-unit-number"
                        options={unitNumberValues}
                        value={selectedUnit}
                        onChange={(event: React.SyntheticEvent, newValue: Unit | null) => {
                            if (newValue) setSelectedUnit(newValue);
                            setNameInput('');
                        }}
                        getOptionLabel={(option: Unit) => {
                            if (option.id === 0) return '';
                            return `${option.unit_number}`;
                        }}
                        renderInput={(params) => 
                            <TextField {...params} 
                                label="Unit Number" 
                                error={showError && !selectedUnit.id} 
                                helperText={showError && !selectedUnit.id ? "Please select a unit" : ""}
                            />
                        }
                    />
                </FormControl>}

                {selectedUnit.id !== 0 && 
                <FormControl>
                    <Autocomplete 
                        value={nameInput}
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
                </FormControl>}                  
            </Box>
        </DialogTemplate>
    );
}

export default ResidentDetailDialog;
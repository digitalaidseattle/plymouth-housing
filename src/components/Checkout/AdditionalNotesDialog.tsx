import { SyntheticEvent, useState } from 'react';
import {
  Typography,
  Box,
  FormControl,
  Stack,
  TextField
} from '@mui/material';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import { CheckoutHistoryItem, CheckoutItemProp, ResidentInfo } from '../../types/interfaces';
import CheckedoutListItem from './CheckedoutListItem';
import DialogTemplate from '../DialogTemplate';

type AdditionalNotesDialogProps = {
    showDialog: boolean,
    handleShowDialog: () => void,
    item: CheckoutItemProp,
    residentInfo: ResidentInfo,
    addItemToCart: (item: CheckoutItemProp) => void;
    checkoutHistory: CheckoutHistoryItem[];
}

type AutocompleteOption = {
    inputValue?: string;
    name: string;
}

const AdditionalNotesDialog = ({
    showDialog, 
    handleShowDialog, 
    item,
    addItemToCart,
    checkoutHistory
    }: AdditionalNotesDialogProps) => {

    const [additionalNotesInput, setAdditionalNotesInput] = useState<string>('')
    const [showError, setShowError] = useState<boolean>(false);
    
    const applianceMiscCheckouts = checkoutHistory.filter(i => i.item_id===166);
    const autocompleteOptions: AutocompleteOption[] = applianceMiscCheckouts.map((appliance: CheckoutHistoryItem) => ({ name: appliance.additionalNotes }))

    const filter = createFilterOptions<AutocompleteOption>();
    

    function handleSubmit(e: SyntheticEvent) {
        e.preventDefault();
        // validate input, show error
        if (!additionalNotesInput) {
            setShowError(true);
            return;
        }
        const updatedItem = {...item, additional_notes: additionalNotesInput}
        addItemToCart(updatedItem);
        handleShowDialog();
    }

    const previousCheckouts = checkoutHistory.map(i => i.item_id).includes(item.id);

    return (
        <DialogTemplate 
            showDialog={showDialog} 
            handleShowDialog={handleShowDialog}
            handleSubmit={handleSubmit}
            submitButtonText='add to cart'
            backButtonText='cancel'>
            {previousCheckouts && checkoutHistory &&
            <Stack gap="1rem">
                <Box>
                    <Typography sx={{ fontSize: '1.5rem', fontWeight: '600' }}>Check before adding item</Typography>
                    <Typography>
                        Please check with a staff member before adding any items that have already been checked out.
                    </Typography>
                </Box>
                <Box>
                    <Stack direction="row" gap="1rem">
                        <Typography sx={{ fontSize: '1rem', fontWeight: '600' }}>Previously checked out</Typography>
                        <Typography>{applianceMiscCheckouts.length} items</Typography>
                    </Stack>
                    <Box sx={{ 
                        border: '1px solid gray',
                        borderRadius: '6px',
                        maxHeight: '8rem',
                        overflowY: 'auto'
                    }}>
                        {applianceMiscCheckouts.map(i => 
                            <CheckedoutListItem key={i.additionalNotes} itemName={i.additionalNotes} timesCheckedOut={i.timesCheckedOut}/>)
                        }
                    </Box>
                </Box>
            </Stack>
            }

            <Stack gap="1rem">
                <Box>
                    <Typography sx={{ fontSize: '1.5rem', fontWeight: '600' }}>Enter {item && item.name} Details</Typography>
                    <Typography>You can specify the appliance here.</Typography>
                </Box>
                
                <FormControl>
                    <Autocomplete 
                        value={additionalNotesInput}
                        onChange={(_event, newValue) => {
                                if (typeof newValue === 'string') {
                                setAdditionalNotesInput(newValue);
                            } else if (newValue && (newValue as AutocompleteOption).inputValue) {
                                setAdditionalNotesInput((newValue as AutocompleteOption).inputValue!);
                            } else if (newValue && (newValue as AutocompleteOption).name) {
                                setAdditionalNotesInput((newValue as AutocompleteOption).name);
                            } else {
                                setAdditionalNotesInput('');
                            }
                        }}
                        filterOptions={(options, params) => {
                            const filtered = filter(options, params);

                            const { inputValue } = params;
                            const isExisting = options.some((option) => inputValue === option.name);
                            if (inputValue !== '' && !isExisting) {
                            filtered.push({
                                inputValue,
                                name: `Add "${inputValue}"`
                            });
                            }
                            return filtered;
                        }}
                        selectOnFocus
                        clearOnBlur 
                        handleHomeEndKeys
                        id="resident-name-autocomplete"
                        options={autocompleteOptions}
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
                        return (
                            <li key={key} {...optionProps}>
                            {option.name}
                            </li>
                        );
                        }}
                        sx={{ width: 300 }}
                        freeSolo
                        renderInput={(params) => (
                        <TextField {...params} label="Name of appliance" 
                            error={showError && !additionalNotesInput} 
                            helperText={showError && !additionalNotesInput ? "Please enter the name of the appliance" : ""}/>
                        )}
                    />
                </FormControl>
            </Stack>
        </DialogTemplate>
    );
}

export default AdditionalNotesDialog;
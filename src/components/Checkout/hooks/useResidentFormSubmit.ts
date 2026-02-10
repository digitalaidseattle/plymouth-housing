import { useState } from 'react';
import { Building, Unit, ResidentInfo, ClientPrincipal } from '../../../types/interfaces';
import { addResident, findResident } from '../CheckoutAPICalls';

export const useResidentFormSubmit = (
    user: ClientPrincipal | null,
    onSuccess: (residentInfo: ResidentInfo) => void
) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [apiError, setApiError] = useState('');

    const handleSubmit = async (
        nameInput: string,
        selectedBuilding: Building,
        selectedUnit: Unit,
        _showError: boolean,
        setShowError: (show: boolean) => void
    ) => {
        setApiError('');
        // validate inputs, show error
        if (!nameInput || !selectedBuilding.id || !selectedUnit.id) {
            setShowError(true);
            return false;
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
            onSuccess({
                id: residentId,
                name: nameInput,
                unit: selectedUnit,
                building: selectedBuilding
            });
            setShowError(false);
            return true;
        } catch (error) {
            console.error('Error submitting resident info', error);
            if (error instanceof TypeError && error.message === 'Failed to fetch') {
                setApiError('Your system appears to be offline. Please check your connection and try again.');
            } else {
                setApiError('An error occurred while submitting. Please try again.');
            }
            setIsSubmitting(false);
            return false;
        } finally {
            document.body.style.cursor = 'default';
        }
    };

    return {
        isSubmitting,
        apiError,
        setApiError,
        handleSubmit
    };
};

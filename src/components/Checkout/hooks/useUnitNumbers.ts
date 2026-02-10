import { useState } from 'react';
import { Unit, ClientPrincipal } from '../../../types/interfaces';
import { getUnitNumbers } from '../CheckoutAPICalls';

export const useUnitNumbers = (
    setSelectedUnit: (unit: Unit) => void
) => {
    const [unitNumberValues, setUnitNumberValues] = useState<Unit[]>([]);
    const [isLoadingUnits, setIsLoadingUnits] = useState(false);
    const [apiError, setApiError] = useState('');

    const fetchUnitNumbers = async (user: ClientPrincipal | null, buildingId: number) => {
        setIsLoadingUnits(true);
        setApiError('');
        document.body.style.cursor = 'wait';
        try {
            const response = await getUnitNumbers(user, buildingId);
            const unitNumbers = response
                .filter((item: Unit) => item.unit_number.trim() !== '');
            setUnitNumberValues(unitNumbers);
            setSelectedUnit({id: 0, unit_number: ''});
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
    };

    return {
        unitNumberValues,
        setUnitNumberValues,
        isLoadingUnits,
        apiError,
        setApiError,
        fetchUnitNumbers
    };
};

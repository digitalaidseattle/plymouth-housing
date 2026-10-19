/**
 *  useUnitNumbers.ts
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { useState } from 'react';
import { Unit, ClientPrincipal } from '../../../types/interfaces';
import { getUnitNumbers } from '../../../services/residentService';
import { SPECIAL_UNITS } from '../../../types/constants';

export const useUnitNumbers = (
    setSelectedUnit: (unit: Unit) => void,
) => {
    const [unitNumberValues, setUnitNumberValues] = useState<Unit[]>([]);
    const [isLoadingUnits, setIsLoadingUnits] = useState(false);
    const [apiError, setApiError] = useState('');

    const fetchUnitNumbers = async (user: ClientPrincipal | null, buildingId: number) => {
        setIsLoadingUnits(true);
        setApiError('');
        // PIT-518: clear stale state BEFORE the request so a slow or failed
        // fetch can't leave the previous building's options visible or its
        // selected unit submittable. Previously only the success path
        // cleared these; the error path left selectedUnit intact, which
        // could attach a resident to a unit from a different building.
        setUnitNumberValues([]);
        setSelectedUnit({id: 0, unit_number: ''});
        document.body.style.cursor = 'wait';
        try {
            const response = await getUnitNumbers(user, buildingId);
            const unitNumbers = response
                .filter((item: Unit) =>
                    item.unit_number.trim() !== '' &&
                    item.unit_number.trim().toLowerCase() !== SPECIAL_UNITS.WELCOME
                );
            setUnitNumberValues(unitNumbers);
        } catch (error) {
            console.error('Error fetching unit numbers:', error);
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

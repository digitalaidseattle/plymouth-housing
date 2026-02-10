import { useState } from 'react';
import { Unit, ClientPrincipal } from '../../../types/interfaces';
import { getUnitNumbers } from '../CheckoutAPICalls';
import { applyWelcomeBasketDefaults } from '../residentFormHelpers';

export const useUnitNumbers = (
    checkoutType: 'general' | 'welcomeBasket',
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

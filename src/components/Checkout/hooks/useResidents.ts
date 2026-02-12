import { useState, useEffect } from 'react';
import { Unit, ClientPrincipal, ResidentNameOption } from '../../../types/interfaces';
import { getResidents, getLastResidentVisit } from '../CheckoutAPICalls';

export const useResidents = (
    user: ClientPrincipal | null,
    selectedUnit: Unit
) => {
    const [existingResidents, setExistingResidents] = useState<ResidentNameOption[]>([]);
    const [nameInput, setNameInput] = useState<string>('');
    const [currentLastVisitDate, setCurrentLastVisitDate] = useState<string | null>(null);
    const [isLoadingResidents, setIsLoadingResidents] = useState(false);
    const [apiError, setApiError] = useState('');

    useEffect(() => {
        let cancelled = false;

        const fetchAllLastVisits = async (residents: { name: string; id: number }[]) => {
            const residentsWithDates = await Promise.all(
                residents.map(async (resident) => {
                    try {
                        const response = await getLastResidentVisit(user, resident.id);
                        const lastVisitDate = response.value?.[0]?.transaction_date || null;
                        return {
                            name: resident.name,
                            id: resident.id,
                            lastVisitDate: lastVisitDate,
                        };
                    } catch (error) {
                        console.error(`Error fetching last visit for resident ${resident.id}:`, error);
                        return {
                            name: resident.name,
                            id: resident.id,
                            lastVisitDate: null,
                        };
                    }
                })
            );
            return residentsWithDates;
        };

        const fetchResidents = async () => {
            if (!selectedUnit?.id) {
                setExistingResidents([]);
                setNameInput('');
                setCurrentLastVisitDate(null);
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
                    const residentsWithDates = await fetchAllLastVisits(response.value);
                    if (cancelled) return;

                    setExistingResidents(residentsWithDates);
                    const lastResident = residentsWithDates[residentsWithDates.length - 1];
                    setNameInput(lastResident.name);
                    setCurrentLastVisitDate(lastResident.lastVisitDate || null);
                } else {
                    setExistingResidents([]);
                    setNameInput('');
                    setCurrentLastVisitDate(null);
                }
            } catch (e) {
                if (cancelled) return;
                console.error('Error fetching residents:', e);
                setExistingResidents([]);
                setNameInput('');
                setCurrentLastVisitDate(null);
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
    }, [user, selectedUnit]);

    return {
        existingResidents,
        nameInput,
        setNameInput,
        currentLastVisitDate,
        setCurrentLastVisitDate,
        isLoadingResidents,
        apiError,
        setApiError
    };
};

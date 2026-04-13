import { useState, useEffect } from 'react';
import { Unit, ClientPrincipal, ResidentNameOption } from '../../../types/interfaces';
import { getResidents, getLastResidentVisit } from '../../../services/residentService';

export const useResidents = (
    user: ClientPrincipal | null,
    selectedUnit: Unit,
    initialResidentName?: string,
    initialLastVisitDate?: string | null,
    isEditMode: boolean = false,
) => {
    const [existingResidents, setExistingResidents] = useState<ResidentNameOption[]>([]);
    const [nameInput, setNameInput] = useState<string>(initialResidentName ?? '');
    const [currentLastVisitDate, setCurrentLastVisitDate] = useState<string | null>(initialLastVisitDate ?? null);
    const [isLoadingResidents, setIsLoadingResidents] = useState(false);
    const [apiError, setApiError] = useState('');

    useEffect(() => {
        let cancelled = false;

        const fetchAllLastVisits = async (residents: { name: string; id: number }[]) => {
            const residentsWithDates = await Promise.all(
                residents.map(async (resident) => {
                    try {
                        const response = await getLastResidentVisit(user, resident.id);
                        const visits = response.value as Array<{ transaction_date: string }>;
                        const lastVisitDate = visits?.[0]?.transaction_date || null;
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
            if (isEditMode || !selectedUnit?.id) {
                setExistingResidents([]);
                if (!initialResidentName && !isEditMode) {
                    setNameInput('');
                }
                if (!isEditMode) {
                    setCurrentLastVisitDate(null);
                }
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

                const residents = response.value as { name: string; id: number }[];
                if (residents.length > 0) {
                    const residentsWithDates = await fetchAllLastVisits(residents);
                    if (cancelled) return;

                    setExistingResidents(residentsWithDates);
                    
                    // If initialResidentName is provided, find and use that resident; otherwise use last
                    let residentToUse = residentsWithDates[residentsWithDates.length - 1];
                    if (initialResidentName) {
                        const matchedResident = residentsWithDates.find(
                            (r) => r.name.toLowerCase() === initialResidentName.toLowerCase()
                        );
                        if (matchedResident) {
                            residentToUse = matchedResident;
                        }
                    }
                    
                    setNameInput(residentToUse.name);
                    setCurrentLastVisitDate(residentToUse.lastVisitDate || null);
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
    }, [user, selectedUnit, initialResidentName, initialLastVisitDate, isEditMode]);

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

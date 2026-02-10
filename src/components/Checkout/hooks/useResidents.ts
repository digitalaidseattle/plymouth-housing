import { useState, useEffect } from 'react';
import { Unit, ClientPrincipal, ResidentNameOption } from '../../../types/interfaces';
import { getResidents } from '../CheckoutAPICalls';

export const useResidents = (
    user: ClientPrincipal | null,
    selectedUnit: Unit
) => {
    const [existingResidents, setExistingResidents] = useState<ResidentNameOption[]>([]);
    const [nameInput, setNameInput] = useState<string>('');
    const [isLoadingResidents, setIsLoadingResidents] = useState(false);
    const [apiError, setApiError] = useState('');

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
                    setNameInput(residents[residents.length - 1].name);
                } else {
                    setExistingResidents([]);
                    setNameInput('');
                }
            } catch (e) {
                if (cancelled) return;
                console.error('Error fetching residents:', e);
                setExistingResidents([]);
                setNameInput('');
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
        isLoadingResidents,
        apiError,
        setApiError
    };
};

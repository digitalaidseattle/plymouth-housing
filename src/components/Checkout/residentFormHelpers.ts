import { Building, Unit } from '../../types/interfaces';

export type ResidentNameOption = {
    inputValue?: string;
    name: string;
}

// Validate form based on checkout mode
export const validateResidentForm = (
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

// Get default resident name based on mode
export const getDefaultResidentName = (
    checkoutType: 'general' | 'welcomeBasket',
    residents: ResidentNameOption[]
): string => {
    if (checkoutType === 'welcomeBasket') {
        const adminResident = residents.find(r => r.name.toLowerCase() === 'admin');
        return adminResident?.name || 'admin';
    }
    return residents.length > 0 ? residents[residents.length - 1].name : '';
};

// Auto-select welcome unit for Welcome Basket mode
export const applyWelcomeBasketDefaults = (
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

// Get helper text for unit validation
export const getUnitHelperText = (showError: boolean, selectedUnit: Unit): string => {
    if (!showError) return "";
    if (selectedUnit.id === 0 && selectedUnit.unit_number) return "Not a valid unit";
    if (selectedUnit.id === 0) return "Please select a unit from the list";
    return "";
};

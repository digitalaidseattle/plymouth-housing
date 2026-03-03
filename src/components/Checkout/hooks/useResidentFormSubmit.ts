import { useState } from 'react';
import {
  Building,
  Unit,
  ResidentInfo,
  ClientPrincipal,
  ResidentFormError,
} from '../../../types/interfaces';
import { addResident, findResident } from '../../../services/CheckoutAPICalls';

export const useResidentFormSubmit = (
  user: ClientPrincipal | null,
  onSuccess: (residentInfo: ResidentInfo) => void,
) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleSubmit = async (
    nameInput: string,
    selectedBuilding: Building,
    selectedUnit: Unit,
    setFormError: (formErrorObject: ResidentFormError) => void,
    currentLastVisitDate: string | null = null,
  ) => {
    const activeErrors = {
      buildingError: false,
      unitError: false,
      nameError: false,
    };
    if (!nameInput.trim()) {
      activeErrors.nameError = true;
    }
    if (!selectedBuilding.id) {
      activeErrors.buildingError = true;
    }
    if (!selectedUnit.id) {
      activeErrors.unitError = true;
    }
    setFormError(activeErrors);
    if (
      activeErrors.nameError ||
      activeErrors.buildingError ||
      activeErrors.unitError
    ) {
      return false;
    }
    setIsSubmitting(true);
    document.body.style.cursor = 'wait';
    try {
      let residentId;
      const existingResponse = await findResident(
        user,
        nameInput,
        selectedUnit.id,
      );
      if (!existingResponse.value.length) {
        const response = await addResident(user, nameInput, selectedUnit.id);
        if (!response.value || response.value.length === 0) {
          throw new Error('Failed to create resident: API returned no data');
        }
        residentId = response.value[0].id;
      } else {
        residentId = existingResponse.value[0].id;
      }

      onSuccess({
        id: residentId,
        name: nameInput,
        unit: selectedUnit,
        building: selectedBuilding,
        lastVisitDate: currentLastVisitDate,
      });
      return true;
    } catch (error) {
      console.error('Error submitting resident info', error);
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        setApiError(
          'Your system appears to be offline. Please check your connection and try again.',
        );
      } else {
        setApiError('An error occurred while submitting. Please try again.');
      }
      return false;
    } finally {
      setIsSubmitting(false);
      document.body.style.cursor = 'default';
    }
  };

  return {
    isSubmitting,
    apiError,
    setApiError,
    handleSubmit,
  };
};

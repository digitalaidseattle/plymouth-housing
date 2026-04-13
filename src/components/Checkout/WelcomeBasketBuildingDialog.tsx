import React, { FormEvent, useState, useContext } from 'react';
import { Box, FormControl, Typography, Chip, Button, useTheme } from '@mui/material';
import BuildingCodeSelect from './BuildingCodeSelect';
import { Building, ResidentInfo, Unit } from '../../types/interfaces';
import { SPECIAL_UNITS } from '../../types/constants';
import DialogTemplate from '../DialogTemplate';
import { UserContext } from '../contexts/UserContext.ts';
import {
  getUnitNumbers,
  getResidents,
  addResident,
  findResident,
} from '../../services/residentService';

type WelcomeBasketBuildingDialogProps = {
  showDialog: boolean;
  handleShowDialog: () => void;
  buildings: Building[];
  setResidentInfo: React.Dispatch<React.SetStateAction<ResidentInfo>>;
  isEditMode?: boolean;
  onDiscardEdits?: () => void;
};

const WelcomeBasketBuildingDialog = ({
  showDialog,
  handleShowDialog,
  buildings,
  setResidentInfo,
  isEditMode = false,
  onDiscardEdits,
}: WelcomeBasketBuildingDialogProps) => {
  const theme = useTheme();
  const { user } = useContext(UserContext);
  const [selectedBuilding, setSelectedBuilding] = useState<Building>({
    id: 0,
    code: '',
    name: '',
  });
  const [showError, setShowError] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string>('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (isEditMode) {
      handleShowDialog();
      return;
    }

    setApiError('');

    if (!selectedBuilding.id) {
      setShowError(true);
      return;
    }

    setIsSubmitting(true);
    document.body.style.cursor = 'wait';

    try {
      const units = await getUnitNumbers(user, selectedBuilding.id);
      const welcomeUnit = units.find(
        (u: Unit) => u.unit_number.trim().toLowerCase() === SPECIAL_UNITS.WELCOME,
      );

      if (!welcomeUnit) {
        setApiError(
          'No welcome unit found for this building. Please contact an administrator.',
        );
        setIsSubmitting(false);
        document.body.style.cursor = 'default';
        return;
      }

      // Fetch or create admin resident for the welcome unit
      const residentsResponse = await getResidents(user, welcomeUnit.id);
      const adminResident = residentsResponse.value.find(
        (r) => r.name.toLowerCase() === 'admin',
      );

      let residentId: number;
      if (!adminResident) {
        const existingResponse = await findResident(
          user,
          'admin',
          welcomeUnit.id,
        );
        if (!existingResponse.value.length) {
          const response = await addResident(user, 'admin', welcomeUnit.id);
          residentId = response.value[0].id;
        } else {
          residentId = existingResponse.value[0].id;
        }
      } else {
        residentId = adminResident.id;
      }

      setResidentInfo({
        id: residentId,
        name: 'admin',
        unit: welcomeUnit,
        building: selectedBuilding,
      });
      setShowError(false);
      handleShowDialog();
    } catch (error) {
      console.error('Error submitting welcome basket building info:', error);
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        setApiError(
          'Unable to connect. Please check your connection and try again.',
        );
      } else {
        setApiError('An error occurred while submitting. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
      document.body.style.cursor = 'default';
    }
  }

  return (
    <DialogTemplate
      showDialog={showDialog}
      handleShowDialog={handleShowDialog}
      handleSubmit={handleSubmit}
      title="provide building code to continue"
      submitButtonText="continue"
      isSubmitting={isSubmitting}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          paddingY: '1rem',
        }}
      >
        {isEditMode && (
          <Chip
            size="small"
            variant="outlined"
            sx={{
              alignSelf: 'flex-start',
              color: theme.palette.text.secondary,
              borderColor: theme.palette.grey[300],
              backgroundColor: 'transparent',
            }}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box component="span">Editing transaction</Box>
                <Button size="small" variant="text" color="primary" onClick={onDiscardEdits}>
                  Discard
                </Button>
              </Box>
            }
          />
        )}
        <FormControl>
          <BuildingCodeSelect
            buildings={buildings}
            selectedBuilding={selectedBuilding}
            setSelectedBuilding={setSelectedBuilding}
            setSelectedUnit={() => {}} // No-op since we don't show unit selector
            fetchUnitNumbers={async () => {}} // No-op since we handle units in submit
            error={showError && !selectedBuilding.id}
            resetError={() => setShowError(false)}
            disabled={isSubmitting || isEditMode}
          />
        </FormControl>
        {apiError && <Typography color="error">{apiError}</Typography>}
      </Box>
    </DialogTemplate>
  );
};

export default WelcomeBasketBuildingDialog;

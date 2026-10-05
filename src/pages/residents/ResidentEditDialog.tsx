/**
 *  ResidentEditDialog.tsx
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { useContext, useEffect, useState } from 'react';
import {
  Autocomplete,
  Box,
  FormControl,
  TextField,
  Typography,
} from '@mui/material';
import { Building, Unit } from '../../types/interfaces';
import BuildingCodeSelect from '../../components/Checkout/BuildingCodeSelect';
import DialogTemplate from '../../components/DialogTemplate';
import { UserContext } from '../../components/contexts/UserContext';
import { useUnitNumbers } from '../../components/Checkout/hooks/useUnitNumbers';

type ResidentEditDialogProps = {
  showDialog: boolean;
  resident: {
    id: number;
    name: string;
    unit: Unit;
    building: Building;
  } | null;
  buildings: Building[];
  onCancel: () => void;
  onSave: (name: string, building: Building, unit: Unit) => Promise<void>;
  isSaving?: boolean;
};

const ResidentEditDialog = ({
  showDialog,
  resident,
  buildings,
  onCancel,
  onSave,
  isSaving = false,
}: ResidentEditDialogProps) => {
  const { user } = useContext(UserContext);

  const [name, setName] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(
    null,
  );
  const [selectedUnit, setSelectedUnit] = useState<Unit>({
    id: 0,
    unit_number: '',
  });

  const [buildingError, setBuildingError] = useState(false);
  const [unitError, setUnitError] = useState(false);

  const unitNumbersHook = useUnitNumbers(setSelectedUnit);

  useEffect(() => {
    if (!showDialog || !resident) return;

    setName(resident.name);
    setSelectedBuilding(resident.building);
    setSelectedUnit(resident.unit);
    setBuildingError(false);
    setUnitError(false);

    void unitNumbersHook.fetchUnitNumbers(user, resident.building.id);
  }, [showDialog, resident, user]);

  useEffect(() => {
    if (!resident || !showDialog) return;

    const currentUnit = unitNumbersHook.unitNumberValues.find(
      (unit) => unit.id === resident.unit.id,
    );

    if (currentUnit) {
      setSelectedUnit(currentUnit);
    }
  }, [unitNumbersHook.unitNumberValues, resident, showDialog]);

  const fetchUnitNumbers = async (buildingId: number) => {
    setUnitError(false);
    await unitNumbersHook.fetchUnitNumbers(user, buildingId);
  };

  const handleBuildingChange = (building: Building) => {
    setSelectedBuilding(building);
    setBuildingError(false);
    setUnitError(false);
  };

  const handleUnitChange = (unit: Unit | null) => {
    setSelectedUnit(unit ?? { id: 0, unit_number: '' });
    setUnitError(false);
  };

  const handleSubmit = async () => {
    if (!resident) return;

    const trimmedName = name.trim();

    if (!trimmedName) {
      return;
    }

    if (!selectedBuilding) {
      setBuildingError(true);
      return;
    }

    if (!selectedUnit.id) {
      setUnitError(true);
      return;
    }

    await onSave(trimmedName, selectedBuilding, selectedUnit);
  };

  if (!resident) return null;

  const isWaiting = isSaving || unitNumbersHook.isLoadingUnits;

  return (
    <DialogTemplate
      showDialog={showDialog}
      handleShowDialog={onCancel}
      handleSubmit={handleSubmit}
      title="Edit Resident"
      submitButtonText="Save"
      isSubmitting={isWaiting}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          py: 1,
        }}
      >
        <TextField
          id="resident-edit-name"
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isWaiting}
          required
          autoFocus
          slotProps={{ htmlInput: { maxLength: 255 } }}
          fullWidth
        />

        <FormControl fullWidth error={buildingError}>
          <BuildingCodeSelect
            buildings={buildings}
            label="Building"
            selectedBuilding={
              selectedBuilding ?? {
                id: 0,
                name: '',
                code: '',
              }
            }
            setSelectedBuilding={handleBuildingChange}
            setSelectedUnit={setSelectedUnit}
            fetchUnitNumbers={fetchUnitNumbers}
            error={buildingError}
            resetError={() => setBuildingError(false)}
            disabled={isWaiting}
          />
        </FormControl>

        <FormControl fullWidth error={unitError}>
          <Autocomplete
            id="resident-edit-unit"
            options={unitNumbersHook.unitNumberValues}
            value={selectedUnit.id ? selectedUnit : null}
            disabled={isWaiting || !selectedBuilding}
            loading={unitNumbersHook.isLoadingUnits}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            getOptionLabel={(option) => option.unit_number}
            onChange={(_event, value) => handleUnitChange(value)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Unit"
                required
                error={unitError || Boolean(unitNumbersHook.apiError)}
                helperText={
                  unitNumbersHook.apiError ||
                  (unitError ? 'Please select a unit' : '')
                }
              />
            )}
          />
        </FormControl>

        <Typography variant="body2" color="text.secondary">
          Current location: {resident.building.code} · Unit{' '}
          {resident.unit.unit_number}
        </Typography>
      </Box>
    </DialogTemplate>
  );
};

export default ResidentEditDialog;

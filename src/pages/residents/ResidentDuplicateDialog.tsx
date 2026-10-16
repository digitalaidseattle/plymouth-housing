
/**
 *  ResidentDuplicateDialog.tsx
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Collapse,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from '@mui/material';
import DialogTemplate from '../../components/DialogTemplate';
import { Building, Unit } from '../../types/interfaces';

type ResidentMatch = {
  id: number;
  name: string;
  building_code: string;
  unit_number: string | number;
};

type ResidentDuplicateDialogProps = {
  showDialog: boolean;
  handleClose: () => void;
  pendingEdit: {
    name: string;
    building: Building;
    unit: Unit;
  };
  matchingResidents: ResidentMatch[];
  onAnotherPerson: () => void;
  onMergeResidents: (targetResidentId: number) => void;
  isSubmitting?: boolean;
};

const ResidentDuplicateDialog = ({
  showDialog,
  handleClose,
  pendingEdit,
  matchingResidents,
  onAnotherPerson,
  onMergeResidents,
  isSubmitting = false,
}: ResidentDuplicateDialogProps) => {
  const [showMatches, setShowMatches] = useState(false);
  const [selectedResidentId, setSelectedResidentId] = useState<number | null>(
    null,
  );

  useEffect(() => {
    if (showDialog) {
      setShowMatches(false);
      setSelectedResidentId(null);
    }
  }, [showDialog]);

  const handleMerge = () => {
    if (selectedResidentId === null || isSubmitting) return;
    onMergeResidents(selectedResidentId);
  };

  return (
    <DialogTemplate
      showDialog={showDialog}
      handleShowDialog={handleClose}
      title="Possible Duplicate Resident"
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          py: 1,
        }}
      >
        <Typography>
          A resident with this name already exists. Review the records below
          before deciding whether to merge them.
        </Typography>

        <Stack spacing={1}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
            CURRENT EDIT · Pending changes
          </Typography>

          <Box
            sx={{
              border: 1,
              borderColor: 'divider',
              borderRadius: 1,
              p: 2,
            }}
          >
            <Typography sx={{ fontWeight: 'bold' }}>
              {pendingEdit.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {pendingEdit.building.code} · Unit {pendingEdit.unit.unit_number}
            </Typography>
          </Box>
        </Stack>

        <Stack spacing={1}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
            EXISTING RESIDENT · Merge target
          </Typography>

          <Button
            variant="outlined"
            fullWidth
            disabled={isSubmitting || matchingResidents.length === 0}
            onClick={() => setShowMatches((previous) => !previous)}
            aria-expanded={showMatches}
            sx={{
              justifyContent: 'space-between',
              textAlign: 'left',
              py: 1,
            }}
          >
            <Box sx={{ textAlign: 'left' }}>
              <Typography sx={{ fontWeight: 'bold' }}>
                Choose an existing resident
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {matchingResidents.length} matching{' '}
                {matchingResidents.length === 1 ? 'record' : 'records'}
              </Typography>
            </Box>
            <Box component="span" aria-hidden="true" sx={{ ml: 2 }}>
              {showMatches ? '▲' : '▼'}
            </Box>
          </Button>

          <Collapse in={showMatches} unmountOnExit>
            <RadioGroup
              value={selectedResidentId === null ? '' : String(selectedResidentId)}
              onChange={(_, value) => setSelectedResidentId(Number(value))}
              aria-label="Select existing resident to merge into"
            >
              <Stack
                spacing={1}
                sx={{
                  maxHeight: 240,
                  overflowY: 'auto',
                  pr: 0.5,
                }}
              >
                {matchingResidents.map((resident) => (
                  <FormControlLabel
                    key={resident.id}
                    value={String(resident.id)}
                    control={<Radio />}
                    disabled={isSubmitting}
                    sx={{
                      alignItems: 'center',
                      width: '100%',
                      mx: 0,
                      px: 1,
                      border: 1,
                      borderColor:
                        selectedResidentId === resident.id
                          ? 'primary.main'
                          : 'divider',
                      borderRadius: 1,
                    }}
                    label={
                      <Box sx={{ py: 1 }}>
                        <Typography sx={{ fontWeight: 'bold' }}>
                          {resident.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {resident.building_code} · Unit {resident.unit_number}
                        </Typography>
                      </Box>
                    }
                  />
                ))}
              </Stack>
            </RadioGroup>
          </Collapse>
        </Stack>

        <Stack
          direction="row"
          sx={{
            justifyContent: 'flex-end',
            flexWrap: 'wrap',
            gap: 1,
          }}
        >
          <Button
            onClick={handleClose}
            disabled={isSubmitting}
            variant="text"
          >
            Cancel
          </Button>
          <Button
            onClick={onAnotherPerson}
            disabled={isSubmitting}
            variant="text"
          >
            Another Person
          </Button>
          <Button
            onClick={handleMerge}
            disabled={isSubmitting || selectedResidentId === null}
            variant="contained"
            color="primary"
          >
            Merge Residents
          </Button>
        </Stack>
      </Box>
    </DialogTemplate>
  );
};

export default ResidentDuplicateDialog;
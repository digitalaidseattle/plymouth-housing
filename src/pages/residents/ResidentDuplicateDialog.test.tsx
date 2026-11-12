
/**
 *  ResidentDuplicateDialog.test.tsx
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import ResidentDuplicateDialog from './ResidentDuplicateDialog';

describe('ResidentDuplicateDialog', () => {
  const pendingEdit = {
    name: 'Maya Fey Updated',
    building: {
      id: 1,
      code: 'AH',
      name: 'Alpha House',
    },
    unit: {
      id: 10,
      unit_number: '201',
      building_id: 1,
    },
  };

  const matchingResidents = [
    {
      id: 42,
      name: 'Maya Fey',
      building_code: 'AH',
      unit_number: '101',
    },
    {
      id: 43,
      name: 'Maya Fey',
      building_code: 'BH',
      unit_number: '202',
    },
    {
      id: 44,
      name: 'Maya Fey',
      building_code: 'AH',
      unit_number: '303',
    },
  ];

  const renderDialog = (
    props: Partial<React.ComponentProps<typeof ResidentDuplicateDialog>> = {},
  ) =>
    render(
      <ResidentDuplicateDialog
        showDialog
        handleClose={vi.fn()}
        pendingEdit={pendingEdit}
        matchingResidents={matchingResidents}
        onAnotherPerson={vi.fn()}
        onMergeResidents={vi.fn()}
        {...props}
      />,
    );

  it('renders the pending edit and matching-record count', () => {
    renderDialog();

    expect(screen.getByText('Possible Duplicate Resident')).toBeTruthy();
    expect(screen.getByText('CURRENT EDIT · Pending changes')).toBeTruthy();
    expect(screen.getByText('Maya Fey Updated')).toBeTruthy();
    expect(screen.getByText('AH · Unit 201')).toBeTruthy();

    expect(screen.getByText('EXISTING RESIDENT · Merge target')).toBeTruthy();
    expect(screen.getByText('Choose an existing resident')).toBeTruthy();
    expect(screen.getByText('3 matching records')).toBeTruthy();
  });

  it('shows matching residents only after the selection button is clicked', () => {
    renderDialog();

    expect(screen.queryByText('AH · Unit 101')).toBeNull();

    fireEvent.click(
      screen.getByRole('button', { name: /Choose an existing resident/i }),
    );

    expect(screen.getByText('AH · Unit 101')).toBeTruthy();
    expect(screen.getByText('BH · Unit 202')).toBeTruthy();
    expect(screen.getByText('AH · Unit 303')).toBeTruthy();
  });

  it('keeps Merge Residents disabled until an existing resident is selected', () => {
    renderDialog();

    const mergeButton = screen.getByRole('button', {
      name: 'Merge Residents',
    });

    expect(mergeButton).toHaveProperty('disabled', true);

    fireEvent.click(
      screen.getByRole('button', { name: /Choose an existing resident/i }),
    );

    fireEvent.click(screen.getByRole('radio', { name: /Maya Fey.*AH.*Unit 101/i }));

    expect(mergeButton).toHaveProperty('disabled', false);
  });

  it('passes the selected target resident ID to onMergeResidents', () => {
    const onMergeResidents = vi.fn();

    renderDialog({ onMergeResidents });

    fireEvent.click(
      screen.getByRole('button', { name: /Choose an existing resident/i }),
    );

    fireEvent.click(screen.getByRole('radio', { name: /Maya Fey.*BH.*Unit 202/i }));

    fireEvent.click(screen.getByRole('button', { name: 'Merge Residents' }));

    expect(onMergeResidents).toHaveBeenCalledTimes(1);
    expect(onMergeResidents).toHaveBeenCalledWith(43);
  });

  it('calls onAnotherPerson when Another Person is clicked', () => {
    const onAnotherPerson = vi.fn();

    renderDialog({ onAnotherPerson });

    fireEvent.click(screen.getByRole('button', { name: 'Another Person' }));

    expect(onAnotherPerson).toHaveBeenCalledTimes(1);
  });

  it('calls handleClose when the dialog close button is clicked', () => {
    const handleClose = vi.fn();

    renderDialog({ handleClose });

    fireEvent.click(screen.getByTestId('dialog-close-btn'));

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('disables actions and resident selection while submitting', () => {
    renderDialog({ isSubmitting: true });

    expect(
      screen.getByRole('button', { name: 'Another Person' }),
    ).toHaveProperty('disabled', true);

    expect(
      screen.getByRole('button', { name: 'Merge Residents' }),
    ).toHaveProperty('disabled', true);

    fireEvent.click(
      screen.getByRole('button', { name: /Choose an existing resident/i }),
    );

    expect(screen.queryByRole('radio')).toBeNull();
  });

  it('shows a singular record count when there is one match', () => {
    renderDialog({ matchingResidents: [matchingResidents[0]] });

    expect(screen.getByText('1 matching record')).toBeTruthy();
  });
});
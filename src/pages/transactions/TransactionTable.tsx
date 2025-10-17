import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid';
import { Box } from '@mui/material';
import { TransactionHistory } from '../../types/interfaces';
import { format } from 'date-fns';

interface TransactionTableProps {
  transactions: TransactionHistory[];
  loading: boolean;
}

export const TransactionTable = ({ transactions, loading }: TransactionTableProps) => {
  const columns: GridColDef[] = [
    {
      field: 'transaction_date',
      headerName: 'Date & Time',
      width: 180,
      valueFormatter: (value: string) => {
        if (!value) return '';
        try {
          return format(new Date(value), 'MMM dd, yyyy h:mm a');
        } catch {
          return value;
        }
      },
    },
    {
      field: 'user_name',
      headerName: 'User',
      width: 150,
      flex: 1,
    },
    {
      field: 'transaction_type_name',
      headerName: 'Transaction Type',
      width: 150,
      valueFormatter: (value: string) => {
        // Capitalize first letter
        return value ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() : '';
      },
    },
    {
      field: 'total_quantity',
      headerName: 'Items',
      width: 100,
      type: 'number',
      align: 'right',
      headerAlign: 'right',
    },
    {
      field: 'building_code',
      headerName: 'Building',
      width: 120,
      valueFormatter: (value: string | null) => value || 'N/A',
    },
    {
      field: 'unit_number',
      headerName: 'Unit',
      width: 100,
      valueFormatter: (value: string | null) => value || 'N/A',
    },
    {
      field: 'resident_name',
      headerName: 'Resident',
      width: 180,
      flex: 1,
      valueFormatter: (value: string | null) => value || 'N/A',
    },
  ];

  return (
    <Box sx={{ height: 600, width: '100%' }}>
      <DataGrid
        rows={transactions}
        columns={columns}
        getRowId={(row: TransactionHistory) => row.transaction_id}
        loading={loading}
        pageSizeOptions={[10, 25, 50, 100]}
        initialState={{
          pagination: {
            paginationModel: { pageSize: 25 },
          },
        }}
        slots={{
          toolbar: GridToolbar,
        }}
        slotProps={{
          toolbar: {
            showQuickFilter: true,
            quickFilterProps: { debounceMs: 500 },
          },
        }}
        disableRowSelectionOnClick
        sx={{
          '& .MuiDataGrid-cell': {
            padding: '8px',
          },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: '#f5f5f5',
            fontWeight: 'bold',
          },
        }}
      />
    </Box>
  );
};

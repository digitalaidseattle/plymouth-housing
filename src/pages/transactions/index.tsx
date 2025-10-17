import { Box, Typography, Alert, CircularProgress, Paper } from '@mui/material';
import { useTransactions } from './useTransactions';
import { TransactionTable } from './TransactionTable';

const TransactionsPage = () => {
  const { transactions, loading, error } = useTransactions();

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Error loading transactions: {error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Transaction History
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Showing all transactions from the system. Use the filters and search to find specific transactions.
      </Typography>
      <Paper elevation={2} sx={{ p: 2 }}>
        <TransactionTable transactions={transactions} loading={loading} />
      </Paper>
    </Box>
  );
};

export default TransactionsPage;

import { Box, Typography } from '@mui/material';

type ResultsContentProps = {
    previousStock: number, 
    quantityAdded: number, 
    newStock: number 
}

const ResultsContent = ({ previousStock, quantityAdded, newStock }: ResultsContentProps) => {
    const showWarning = newStock < 0;

  return (
    <>
        <Typography sx={{ fontSize: '20px', }}>
            Inventory Updated
        </Typography>
        <Box>
            <Typography>Previous Stock: {previousStock}</Typography>
            <Typography>Quantity Added: {quantityAdded}</Typography>
            <Typography>New Stock Total: {newStock}</Typography>
        </Box>
    </>
  )

}

export default ResultsContent;
import { Box, Chip, Typography } from "@mui/material"

const CheckedoutListItem = ({ itemName, timesCheckedOut }: { itemName: string, timesCheckedOut: number }) => {
    return (
        <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem 1.5rem',
            borderBottom: '1px solid gray',
            '&:last-child': { borderBottom: 'none' }
            }}>
            <Typography sx={{ textTransform: 'capitalize', fontSize: '1.125rem' }}>{itemName}</Typography>
            <Chip label={`Checked out ${timesCheckedOut}x`} sx={{ background: 'rgb(216, 241, 205)' }} />
        </Box>
    )
}

export default CheckedoutListItem;
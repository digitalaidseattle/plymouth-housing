import { Box, Chip, Typography } from "@mui/material"

const CheckedoutListItem = ({ itemName, timesCheckedOut }: { itemName: string, timesCheckedOut: number }) => {
    return (
        <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '2 3',
            borderBottom: '1px solid gray',
            '&:last-child': { borderBottom: 'none' }
            }}>
            <Typography sx={{ textTransform: 'capitalize', typography: 'body1' }}>{itemName}</Typography>
            <Chip label={`Checked out ${timesCheckedOut}x`} sx={{ background: 'rgb(216, 241, 205)' }} />
        </Box>
    )
}

export default CheckedoutListItem;
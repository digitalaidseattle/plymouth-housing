/**
 *  App.tsx
 *
 *  @copyright 2024 Digital Aid Seattle
 *
 */
import React, { useContext, useState } from 'react';

// material-ui
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    TextField,
    Typography
} from '@mui/material';
import { Ticket, ticketService } from './ticketService';
import useAppConstants from '../../services/useAppConstants';
import { UserContext } from '../../components/contexts/UserContext';

interface TicketDialogProps {
    open: boolean,
    handleSuccess: (resp: Ticket | null) => void,
    handleError: (err: Error) => void
}
const TicketDialog: React.FC<TicketDialogProps> = ({ open, handleSuccess, handleError }) => {

    const { user } = useContext(UserContext)
    const { data: sources } = useAppConstants('SOURCE');
    const [source, setSource] = useState("email");

    const iconBackColorOpen = 'grey.300';
    const iconBackColor = 'grey.100';

    return <Dialog
        fullWidth={true}
        open={open}
        onClose={() => handleSuccess(null)}
        PaperProps={{
            component: 'form',
            onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
                event.preventDefault();
                const formData = new FormData(event.currentTarget);
                const formJson = Object.fromEntries(formData.entries());
                // Review: as unknown as Ticket
                ticketService.createTicket(user!, formJson as unknown as Ticket)
                    .then((resp: Ticket) => handleSuccess(resp))
                    .catch(err => handleError(err))
            },
        }}
    >
        <DialogTitle><Typography fontSize={24}>Create Service Ticket</Typography></DialogTitle>
        <DialogContent>
            <Stack spacing={2}>
                <DialogContentText>
                    Ticket will be added to data store.
                </DialogContentText>
                <Stack spacing={2}>
                    <FormControl>
                        <InputLabel>Input Source</InputLabel>
                        <Select
                            id="inputSource"
                            name="inputSource"
                            value={source}
                            label="Input Source"
                            fullWidth
                            onChange={(event) => setSource(event.target.value)}                    >
                            {sources.map((s, idx: number) => <MenuItem key={idx} value={s.value}>{s.label}</MenuItem>)}
                        </Select>
                    </FormControl>
                    <TextField
                        id="clientName"
                        name="clientName"
                        type="text"
                        label="Client Name"
                        fullWidth
                        variant="standard"
                        required={true}
                    />
                    <TextField
                        id="email"
                        name="email"
                        type="email"
                        label="Email Address"
                        fullWidth
                        variant="standard"
                    />
                    <TextField
                        id="phone"
                        name="phone"
                        type="phone"
                        label="Phone"
                        fullWidth
                        variant="standard"
                    />
                    <TextField
                        id="summary"
                        name="summary"
                        type="text"
                        label="Summary"
                        fullWidth
                        variant="standard"
                        required={true}
                    />
                    <TextField
                        id="description"
                        name="description"
                        type="text"
                        label="Description"
                        fullWidth
                        variant="standard"
                        multiline
                        rows={4}
                    />
                </Stack>
            </Stack>
        </DialogContent>
        <DialogActions>
            <Button
                variant='outlined'
                sx={{ color: 'text.secondary', bgcolor: open ? iconBackColorOpen : iconBackColor }}
                onClick={() => handleSuccess(null)}>Cancel</Button>
            <Button
                variant='outlined'
                sx={{ color: 'text.success', bgcolor: open ? iconBackColorOpen : iconBackColor }}
                type="submit">OK</Button>
        </DialogActions>
    </Dialog>
}
export default TicketDialog;

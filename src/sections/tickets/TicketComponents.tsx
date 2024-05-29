import { Link, MenuItem, Select, Stack, TextField, Typography, Autocomplete } from "@mui/material";
import moment from "moment";
import { Link as RouterLink } from 'react-router-dom';
import Dot from "../../components/@extended/Dot";
import MainCard from "../../components/MainCard";
import { Ticket, TicketHistory, Staff } from "./ticketService";
import useAppConstants from "../../services/useAppConstants";


interface TicketProps {
    ticket: Ticket
}

// ==============================|| Table Cell Renderers ||============================== //

const TicketContact: React.FC<TicketProps> = ({ ticket }) => {
    const strings = [ticket.email, ticket.phone];
    return strings.filter(s => s).join(" | ");
}

const TicketStatus: React.FC<TicketProps> = ({ ticket }) => {
    let color;
    let title;

    switch (ticket.status) {
        case 'completed':
            color = 'success';
            title = 'Completed';
            break;
        case 'inprogress':
            color = 'warning';
            title = 'In Progress';
            break;
        case 'blocked':
            color = 'error';
            title = 'Blocked';
            break;
        case 'new':
        default:
            color = 'primary';
            title = 'New';
    }

    return (
        <Stack direction="row" spacing={1} alignItems="center">
            <Dot color={color} />
            <Typography>{title}</Typography>
        </Stack>
    );
};

const TicketLink: React.FC<TicketProps> = ({ ticket }) => {
    return <Link color="secondary" component={RouterLink} to={`/ticket/${ticket.id}`}>
        {ticket.id}
    </Link>
}

// ==============================|| Ticket Detail Renderers ||============================== //

// project import
interface TicketFormProps extends TicketProps {
    onChanged: (field: string, value: unknown) => void;
    staff: Staff[];
    messages: Map<string, string>;
}

const TicketLongForm: React.FC<TicketFormProps> = ({ ticket, staff, messages, onChanged }) => {
    const { data: sources } = useAppConstants('SOURCE');

    return (
        <MainCard>
            <Stack spacing={'1rem'}>
                <TextField
                    id="clientName"
                    error={messages.get('clientName') !== undefined}
                    helperText={messages.get('clientName')}
                    name="clientName"
                    type="text"
                    label="Client Name"
                    fullWidth
                    variant="outlined"
                    value={ticket.clientName}
                    required={true}
                    onChange={(e) => onChanged('clientName', e.target.value)}
                />
                <TextField
                    id="email"
                    name="email"
                    type="email"
                    label="Email Address"
                    fullWidth
                    variant="outlined"
                    value={ticket.email}
                    onChange={(e) => onChanged('email', e.target.value)}
                />
                <TextField
                    id="phone"
                    name="phone"
                    type="phone"
                    label="Phone"
                    fullWidth
                    variant="outlined"
                    value={ticket.phone}
                    onChange={(e) => onChanged('phone', e.target.value)}
                />
                <TextField
                    id="summary"
                    error={messages.get('summary') !== undefined}
                    helperText={messages.get('summary')}
                    name="summary"
                    type="text"
                    label="Summary"
                    fullWidth
                    variant="outlined"
                    required={true}
                    value={ticket.summary}
                    onChange={(e) => onChanged('summary', e.target.value)}
                />
                <TextField
                    id="description"
                    name="description"
                    type="text"
                    label="Description"
                    fullWidth
                    variant="outlined"
                    multiline
                    rows={4}
                    value={ticket.description}
                    onChange={(e) => onChanged('description', e.target.value)}
                />
                <Select
                    id="inputSource"
                    name="inputSource"
                    value={ticket.inputSource}
                    label="Input Source"
                    fullWidth
                    onChange={(event) => onChanged('inputSource', event.target.value)}                    >
                    {sources.map((s, idx: number) => <MenuItem key={idx} value={s.value}>{s.label}</MenuItem>)}
                </Select>
                <Autocomplete
                    id="assignee"
                    value={ticket.assignee}
                    onChange={(_event: any, newValue: string | null) => {
                        onChanged('assignee', newValue);
                    }}
                    sx={{ width: "100%" }}
                    options={staff ? staff.map(e => e.name) : []}
                    renderInput={(params) => <TextField {...params} label="Assigned to" />}
                />
            </Stack>
        </MainCard>
    )
}

const TicketHistoryCard: React.FC<TicketProps> = ({ ticket }) => {
    return (<MainCard title="History">
        <Stack spacing={'1rem'}>
            {ticket.ticket_history
                .sort((h1: TicketHistory, h2: TicketHistory) => moment(h2.created_at).diff(moment(h1.created_at)))
                .map((hist: TicketHistory, idx: number) => {
                    const date = moment(hist.created_at)
                    return <MainCard key={idx}>
                        <Typography>Action: {hist.description}</Typography>
                        <Typography>Date: {date.format("MM-DD-YYYY")} {date.format("hh:mm")}</Typography>
                        <Typography>Change By: {hist.change_by}</Typography>
                    </MainCard>
                })}
        </Stack>
    </MainCard>);
}

export {
    TicketContact, TicketHistoryCard,
    TicketLink, TicketLongForm, TicketStatus
};
export type { TicketProps };


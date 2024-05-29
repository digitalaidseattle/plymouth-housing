import { Card, CardContent } from '@mui/material';
import { Ticket } from '../../sections/tickets/ticketService';

type TicketItemProps = {
  ticket: Ticket;
};

const TicketItem = ({ ticket }: TicketItemProps) => {
  return (
    <Card>
      <CardContent>id: {ticket.id}</CardContent>
      <CardContent>Description: {ticket.description}</CardContent>
    </Card>
  );
};

export default TicketItem;
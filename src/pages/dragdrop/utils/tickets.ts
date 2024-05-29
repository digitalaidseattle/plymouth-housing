import { Status } from '../types';
import { Ticket } from '../../../sections/tickets/ticketService';

export const getTicketsByStatus = (tickets: Ticket[], status: Status) => {
  return tickets.filter((ticket) => ticket.status === status);
};

export const getTicketById = (tickets: Ticket[], id: number) => {
  return tickets.find((ticket) => ticket.id === id);
};

export type Status = 'new' | 'inprogress' | 'completed' | 'blocked';

import { Ticket } from '../../../sections/tickets/ticketService';

export type BoardSections = {
  [name: string]: Ticket[];
};

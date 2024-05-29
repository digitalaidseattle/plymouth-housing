
import Box from '@mui/material/Box';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import Typography from '@mui/material/Typography';
import { Ticket } from '../../sections/tickets/ticketService';
import TicketItem from './TicketItem';
import SortableTicketItem from './SortableTicketItem';

type BoardSectionProps = {
  id: string;
  title: string;
  tickets: Ticket[];
};

const BoardSection = ({ id, title, tickets }: BoardSectionProps) => {
  const { setNodeRef } = useDroppable({
    id,
  });

  return (
    <Box sx={{ backgroundColor: '#eee', padding: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        {title}
      </Typography>
      <SortableContext
        id={id}
        items={tickets}
        strategy={verticalListSortingStrategy}
      >
        <div ref={setNodeRef}>
          {tickets.map((ticket) => (
            <Box key={ticket.id} sx={{ mb: 2 }}>
              <SortableTicketItem id={ticket.id}>
                <TicketItem ticket={ticket} />
              </SortableTicketItem>
            </Box>
          ))}
        </div>
      </SortableContext>
    </Box>
  );
};

export default BoardSection;

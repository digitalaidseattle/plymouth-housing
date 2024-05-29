import { useState, useEffect, useContext } from 'react';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import {
  useSensors,
  useSensor,
  PointerSensor,
  KeyboardSensor,
  DndContext,
  closestCorners,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  DragOverlay,
  DropAnimation,
  defaultDropAnimation,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates, arrayMove } from '@dnd-kit/sortable';
import { BoardSections as BoardSectionsType } from './types';
import { getTicketById } from './utils/tickets';
import { findBoardSectionContainer, initializeBoard } from './utils/board';
import BoardSection from './BoardSection';
import TicketItem from './TicketItem';
import { Ticket, ticketService } from '../../sections/tickets/ticketService';
import { UserContext } from '../../components/contexts/UserContext';

const BoardSectionList = () => {
const { user } = useContext(UserContext);
const NUM_TIX = 20;
const [tickets, setTickets] = useState<Ticket[]>([]);
const [boardSections, setBoardSections] =
    useState<BoardSectionsType>();

    useEffect(() => {
        ticketService.getTickets(NUM_TIX)
            .then((tix) => setTickets(tix));
    }, []);

    useEffect(() => {
        const initialBoardSections = initializeBoard(tickets);
        setBoardSections(initialBoardSections);
    }, [tickets]);


  const [activeTicketId, setActiveTicketId] = useState<null | number>(null);

  const [changes, setChanges] = useState<Record<string, unknown>>({});

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveTicketId(active.id as number);
  };

  const handleDragOver = ({ active, over }: DragOverEvent) => {
    // Find the containers
    const activeContainer = findBoardSectionContainer(
      boardSections!,
      active.id as number
    );
    const overContainer = findBoardSectionContainer(
      boardSections!,
      over?.id as number
    );

    if (
      !activeContainer ||
      !overContainer ||
      activeContainer === overContainer
    ) {
      return;
    }


    setBoardSections((boardSection) => {
      const activeItems = boardSection![activeContainer];
      const overItems = boardSection![overContainer];

      // Find the indexes for the items
      const activeIndex = activeItems.findIndex(
        (item) => item.id === active.id
      );
      const overIndex = overItems.findIndex((item) => item.id !== over?.id);

      return {
        ...boardSection,
        [activeContainer]: [
          ...boardSection![activeContainer].filter(
            (item) => item.id !== active.id
          ),
        ],
        [overContainer]: [
          ...boardSection![overContainer].slice(0, overIndex),
          boardSections![activeContainer][activeIndex],
          ...boardSection![overContainer].slice(
            overIndex,
            boardSection![overContainer].length
          ),
        ],
      };
    });

  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    const activeContainer = findBoardSectionContainer(
      boardSections!,
      active.id as number
    );
    const overContainer = findBoardSectionContainer(
      boardSections!,
      over?.id as number
    );
    

    if (
      !activeContainer ||
      !overContainer ||
      activeContainer !== overContainer
    ) {
      return;
    }

    const activeIndex = boardSections![activeContainer].findIndex(
      (ticket) => ticket.id === active.id
    );
    const overIndex = boardSections![overContainer].findIndex(
      (ticket) => ticket.id === over?.id
    );

    if (activeIndex !== overIndex) {
      setBoardSections((boardSection) => ({
        ...boardSection,
        [overContainer]: arrayMove(
          boardSection![overContainer],
          activeIndex,
          overIndex
        ),
      }));
    }
    // persist status changes in database
    changes["status"] = active.data.current?.sortable.containerId;
    setChanges({ ...changes });
    ticketService.updateTicket(user!, ticket!, changes)
      .then(() => {
        setChanges({});
      })

    setActiveTicketId(null);
  };

  const dropAnimation: DropAnimation = {
    ...defaultDropAnimation,
  };

  const ticket = activeTicketId ? getTicketById(tickets, activeTicketId) : null;

  return (
    boardSections &&
    <Container>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <Grid container spacing={4}>
          {Object.keys(boardSections).map((boardSectionKey) => (
            <Grid item xs={3} key={boardSectionKey}>
              <BoardSection
                id={boardSectionKey}
                title={boardSectionKey}
                tickets={boardSections[boardSectionKey]}
              />
            </Grid>
          ))}
          <DragOverlay dropAnimation={dropAnimation}>
            {ticket ? <TicketItem ticket={ticket} /> : null}
          </DragOverlay>
        </Grid>
      </DndContext>
    </Container>
  );
};

export default BoardSectionList;

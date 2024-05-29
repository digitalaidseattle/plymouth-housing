import { BoardSections, Status } from '../types';
import { Ticket } from '../../../sections/tickets/ticketService';
import { BOARD_SECTIONS } from '../constants';
import { getTicketsByStatus } from './tickets';

export const initializeBoard = (tickets: Ticket[]) => {
  const boardSections: BoardSections = {};

  Object.keys(BOARD_SECTIONS).forEach((boardSectionKey) => {
    boardSections[boardSectionKey] = getTicketsByStatus(
      tickets,
      boardSectionKey as Status
    );
  });

  return boardSections;
};

export const findBoardSectionContainer = (
  boardSections: BoardSections,
  id: number
) => {
  if (id in boardSections) {
    return id;
  }

  const container = Object.keys(boardSections).find((key) =>
    boardSections[key].find((item) => item.id === id)
  );
  return container;
};

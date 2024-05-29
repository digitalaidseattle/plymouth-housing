/**
 *  ticketService.test.ts
 * 
 *  @copyright 2024 Digital Aid Seattle
 *
 */
import { describe, expect, it, vi } from 'vitest'
import { supabaseClient, QueryModel } from '../../services/supabaseClient'
import { Ticket, TicketHistory, ticketService } from './ticketService'
import { User } from '@supabase/supabase-js';

const mockFilterBuilder = {
    limit: vi.fn(() => Promise.resolve({})),
    range: vi.fn(() => Promise.resolve({})),
    order: vi.fn(() => Promise.resolve({}))
};

const mockQueryBuilder = {
    insert: vi.fn(() => Promise.resolve({})),
    update: vi.fn(() => Promise.resolve({})),
    select: vi.fn(() => Promise.resolve({})),
    eq: vi.fn(() => Promise.resolve({}))
};

describe('ticketService tests', () => {

    it('query', async () => {
        const queryModel = {
            page: 0,
            pageSize: 10,
            sortField: 'created_at',
            sortDirection: 'desc'
        } as QueryModel
        const response = { data: [{}], count: 5, error: null }

        const fromSpy = vi.spyOn(supabaseClient, "from")
            .mockReturnValue(mockQueryBuilder as any)
        const selectSpy = vi.spyOn(mockQueryBuilder, "select")
            .mockReturnValue(mockFilterBuilder as any)
        const rangeSpy = vi.spyOn(mockFilterBuilder, "range")
            .mockReturnValue(mockFilterBuilder as any)
        const orderSpy = vi.spyOn(mockFilterBuilder, "order")
            .mockReturnValue(Promise.resolve(response))

        const tixs = await ticketService.query(queryModel)
        expect(fromSpy).toHaveBeenCalledWith('service_ticket')
        expect(selectSpy).toHaveBeenCalledWith('*', { count: 'exact' })
        expect(rangeSpy).toHaveBeenCalledWith(0, 9)
        expect(orderSpy).toHaveBeenCalledWith('created_at', { ascending: false })
        expect(tixs.rows.length).toEqual(1);
        expect(tixs.totalRowCount).toEqual(5);
    });

    it('getTickets', async () => {
        const LIMIT = 10;
        const response = { data: [{}], error: null }

        const fromSpy = vi.spyOn(supabaseClient, "from")
            .mockReturnValue(mockQueryBuilder as any)
        const selectSpy = vi.spyOn(mockQueryBuilder, "select")
            .mockReturnValue(mockFilterBuilder as any)
        const limitSpy = vi.spyOn(mockFilterBuilder, "limit")
            .mockReturnValue(mockFilterBuilder as any)
        const orderSpy = vi.spyOn(mockFilterBuilder, "order")
            .mockReturnValue(Promise.resolve(response))

        const tixs = await ticketService.getTickets(LIMIT)
        expect(fromSpy).toHaveBeenCalledWith('service_ticket')
        expect(selectSpy).toHaveBeenCalled()
        expect(limitSpy).toHaveBeenCalledWith(LIMIT)
        expect(orderSpy).toHaveBeenCalledWith('created_at', { ascending: false })
        expect(tixs.length).toEqual(1);
    });

    it('createTicket', async () => {
        const user = { email: 'eee' } as User;
        const tix = {} as Ticket;
        const created = { id: 22 } as Ticket;
        const updated = { id: 22 } as Ticket;
        const response = { data: [created], error: null }
        const history = {} as TicketHistory;

        const fromSpy = vi.spyOn(supabaseClient, "from")
            .mockReturnValue(mockQueryBuilder as any);
        const insertSpy = vi.spyOn(mockQueryBuilder, "insert")
            .mockReturnValue(mockQueryBuilder as any);
        const selectSpy = vi.spyOn(mockQueryBuilder, "select")
            .mockReturnValue(Promise.resolve(response));
        const createTicketHistorySpy = vi.spyOn(ticketService, "createTicketHistory")
            .mockReturnValue(Promise.resolve(history))
        const getTicketSpy = vi.spyOn(ticketService, "getTicket")
            .mockReturnValue(Promise.resolve(updated))

        const actual = await ticketService.createTicket(user, tix)
        expect(fromSpy).toHaveBeenCalledWith('service_ticket')
        expect(insertSpy).toHaveBeenCalledWith(tix)
        expect(selectSpy).toHaveBeenCalled()
        expect(createTicketHistorySpy).toHaveBeenCalled()
        expect(createTicketHistorySpy).toHaveBeenCalledWith({
            'service_ticket_id': 22,
            'description': 'New ticket',
            'change_by': 'eee'
        })
        expect(tix.status).toBe('new');
        expect(getTicketSpy).toHaveBeenCalledWith(22);
        expect(actual).toEqual(updated);
    });

    it('updateTicket', async () => {
        const user = { email: 'fff' } as User;
        const tix = { id: 33 } as Ticket;
        const changes = {
            clientName: 'clientName',
            description: 'desc'
        };
        const updated = { id: 33 } as Ticket;
        const expected = { id: 33 } as Ticket;
        const response = { data: [updated], error: null }
        const history = {} as TicketHistory;

        const fromSpy = vi.spyOn(supabaseClient, "from")
            .mockReturnValue(mockQueryBuilder as any);
        const updateSpy = vi.spyOn(mockQueryBuilder, "update")
            .mockReturnValue(mockQueryBuilder as any);
        const eqSpy = vi.spyOn(mockQueryBuilder, "eq")
            .mockReturnValue(mockQueryBuilder as any);
        const selectSpy = vi.spyOn(mockQueryBuilder, "select")
            .mockReturnValue(Promise.resolve(response));
        const createTicketHistorySpy = vi.spyOn(ticketService, "createTicketHistory")
            .mockReturnValue(Promise.resolve(history))
        const getTicketSpy = vi.spyOn(ticketService, "getTicket")
            .mockReturnValue(Promise.resolve(expected))

        const actual = await ticketService.updateTicket(user, tix, changes)
        expect(fromSpy).toHaveBeenCalledWith('service_ticket')
        expect(updateSpy).toHaveBeenCalledWith(changes)
        expect(eqSpy).toHaveBeenCalledWith('id', 33)
        expect(selectSpy).toHaveBeenCalled()
        expect(createTicketHistorySpy).toHaveBeenCalled()
        expect(createTicketHistorySpy).toHaveBeenCalledWith({
            'service_ticket_id': 33,
            'description': 'Changed \"clientName\" to \"clientName\"\nChanged \"description\" to \"desc\"',
            'change_by': 'fff'
        })
        expect(getTicketSpy).toHaveBeenCalledWith(33)
        expect(actual).toEqual(expected);
    });

    it('getStaff', async () => {
        const response = { data: [{}], error: null }
        const fromSpy = vi.spyOn(supabaseClient, "from")
            .mockReturnValue(mockQueryBuilder as any)
        const selectSpy = vi.spyOn(mockQueryBuilder, "select")
            .mockReturnValue(mockFilterBuilder as any)
            .mockReturnValue(Promise.resolve(response))

        const tixs = await ticketService.getStaff()
        expect(fromSpy).toHaveBeenCalledWith('staff')
        expect(selectSpy).toHaveBeenCalled()
        expect(tixs.length).toEqual(1);
    });

})

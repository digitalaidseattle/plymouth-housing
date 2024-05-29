/**
 *  authService.ts
 *
 *  @copyright 2024 Digital Aid Seattle
 *
 */

import { User } from "@supabase/supabase-js";
import { supabaseClient, PageInfo, QueryModel } from "../../services/supabaseClient";


type Ticket = {
    id: number,
    created_at: Date,
    inputSource: string,
    summary: string,
    description: string,
    status: string,
    assignee: string,
    due_date: Date,
    phone: string,
    email: string,
    clientName: string,
    ticket_history: TicketHistory[]
};

type TicketHistory = {
    service_ticket_id: number
    created_at: Date,
    description: string,
    property: string,
    value: string,
    change_by: string
};

type Staff = {
    id: number,
    created_at: Date,
    name: string,
    email: string,
    roles: string,
};

class TicketService {

    validateTicket(updated: Ticket): Map<string, string> {
        const map = new Map<string, string>();
        console.log(updated)
        if (updated.clientName.trim() === '') {
            map.set('clientName', 'Client name is required.')
        }
        if (updated.summary.trim() === '') {
            map.set('summary', 'Summary is required.')
        }
        return map;
    }

    async query(query: QueryModel): Promise<PageInfo<Ticket>> {
        const _offset = query.page ? query.page * query.pageSize : 0;
        return supabaseClient.from('service_ticket')
            .select('*', { count: 'exact' })
            .range(_offset, _offset + query.pageSize - 1)
            .order(query.sortField, { ascending: query.sortDirection === 'asc' })
            .then(resp => {
                return {
                    rows: resp.data as Ticket[],
                    totalRowCount: resp.count || 0
                }
            })
    }

    async getTickets(count: number): Promise<Ticket[]> {
        return supabaseClient.from('service_ticket')
            .select()
            .limit(count)
            .order('created_at', { ascending: false })
            .then(tixResp => tixResp.data ?? [])
    }

    async getTicket(ticket_id: number): Promise<Ticket> {
        return supabaseClient.from('service_ticket')
            .select('*, ticket_history(*)')
            .eq('id', ticket_id)
            .single()
            .then(tixResp => tixResp.data ?? undefined )
    }

    async createTicket(user: User, tix: Ticket): Promise<Ticket> {
        tix.status = 'new';
        return supabaseClient.from('service_ticket')
            .insert(tix)
            .select()
            .then(async tixResp => {
                const ticket = tixResp.data![0] as Ticket;
                const history = {
                    'service_ticket_id': ticket.id,
                    'description': 'New ticket',
                    'change_by': user.email
                }
                return this.createTicketHistory(history as TicketHistory)
                    .then(() => this.getTicket(ticket.id))
            })
    }

    async updateTicket(user: User, tix: Ticket, changes: Record<string, unknown>): Promise<Ticket> {
        return supabaseClient.from('service_ticket')
            .update(changes)
            .eq('id', tix.id)
            .select()
            .then(async tixResp => {
                const ticket = tixResp.data![0] as Ticket;
                const description = Object.entries(changes).map(e => `Changed "${e[0]}" to "${e[1]}"`).join('\n');
                const history = {
                    'service_ticket_id': tix.id,
                    'description': description,
                    'change_by': user.email
                }
                return this.createTicketHistory(history as TicketHistory)
                    .then(() => this.getTicket(ticket.id))
            })
    }


    async createTicketHistory(history: TicketHistory): Promise<TicketHistory> {
        return supabaseClient.from('ticket_history')
            .insert(history)
            .select()
            .then(histResp => histResp.data![0] as TicketHistory);
    }

    async getStaff(): Promise<Staff[]> {
        return supabaseClient.from('staff')
            .select()
            .then(tixResp => tixResp.data as Staff[])
    }

}

const ticketService = new TicketService()
export { ticketService };
export type { PageInfo, Ticket, Staff, TicketHistory };


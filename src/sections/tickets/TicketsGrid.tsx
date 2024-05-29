/**
 * TicketsGrid.tsx
 * 
 * Example of integrating tickets with data-grid
 */
import { useContext, useEffect, useState } from 'react';

// material-ui
import {
    DataGrid,
    GridColDef,
    GridRenderCellParams,
    GridRowSelectionModel,
    GridSortModel,
    useGridApiRef
} from '@mui/x-data-grid';
import {
    Box,
    Button,
    Stack
} from '@mui/material';

// third-party

// project import
import { QueryModel } from '../../services/supabaseClient';
import useAppConstants, { AppConstant } from '../../services/useAppConstants';
import { TicketContact, TicketLink, TicketStatus } from './TicketComponents';
import { PageInfo, Ticket, ticketService } from './ticketService';
import { RefreshContext } from '../../components/contexts/RefreshContext';

// ==============================|| Tickets Grid ||============================== //

const PAGE_SIZE = 10;

const getColumns = (statuses: AppConstant[]): GridColDef[] => {
    return [
        {
            field: 'id', headerName: 'ID', width: 90,
            renderCell: (params: GridRenderCellParams<Ticket, string>) => (
                <TicketLink ticket={params.row!} />
            )
        },
        {
            field: 'clientName',
            headerName: 'Client Name',
            width: 150,
        },
        {
            field: 'email',
            headerName: 'Contact',
            width: 200,
            renderCell: (params: GridRenderCellParams<Ticket, string>) => (
                <TicketContact ticket={params.row!} />
            )
        },
        {
            field: 'status',
            headerName: 'Status',
            width: 140,
            renderCell: (params: GridRenderCellParams<Ticket, string>) => (
                <TicketStatus ticket={params.row!} />
            ),
            type: "singleSelect",
            valueOptions: statuses
        },
        {
            field: 'assignee',
            headerName: 'Assigned To',
            width: 160,
        },
        {
            field: 'summary',
            headerName: 'summary',
            width: 160,
        }
    ];
}

export default function TicketsGrid() {
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: PAGE_SIZE });
    const [sortModel, setSortModel] = useState<GridSortModel>([{ field: 'created_at', sort: 'desc' }])
    const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>();
    const [pageInfo, setPageInfo] = useState<PageInfo<Ticket>>({ rows: [], totalRowCount: 0 });
    const [rowCountState, setRowCountState] = useState(pageInfo?.totalRowCount || 0,);
    const apiRef = useGridApiRef();
    const { refresh } = useContext(RefreshContext);
    const { data: statuses } = useAppConstants('STATUS')

    useEffect(() => {
        setRowCountState((prevRowCountState: number) =>
            pageInfo?.totalRowCount !== undefined
                ? pageInfo?.totalRowCount
                : prevRowCountState,
        );
    }, [pageInfo?.totalRowCount, setRowCountState]);

    useEffect(() => {
        if (paginationModel && sortModel) {
            const queryModel = {
                page: paginationModel.page,
                pageSize: paginationModel.pageSize,
                sortField: sortModel.length === 0 ? 'created_at' : sortModel[0].field,
                sortDirection: sortModel.length === 0 ? 'created_at' : sortModel[0].sort
            } as QueryModel
            ticketService.query(queryModel)
                .then((pi) => setPageInfo(pi))
        }
    }, [paginationModel, sortModel])

    useEffect(() => {
        const queryModel = {
            page: paginationModel.page,
            pageSize: paginationModel.pageSize,
            sortField: sortModel.length === 0 ? 'created_at' : sortModel[0].field,
            sortDirection: sortModel.length === 0 ? 'created_at' : sortModel[0].sort
        } as QueryModel
        ticketService.query(queryModel)
            .then((pi) => setPageInfo(pi))
    }, [refresh])

    const applyAction = () => {
        alert(`Apply some action to ${rowSelectionModel ? rowSelectionModel.length : 0} items.`)
    }
    const newTicket = () => {
        alert(`New Clicked`)
    }
    return (
        <Box>
            <Stack direction="row" spacing={'1rem'}>
                <Button
                    title='Action'
                    variant="contained"
                    color="primary"
                    onClick={newTicket}>
                    {'New'}
                </Button>
                <Button
                    title='Action'
                    variant="contained"
                    color="secondary"
                    disabled={!(rowSelectionModel && rowSelectionModel.length > 0)}
                    onClick={applyAction}>
                    {'Action'}
                </Button>
            </Stack>
            <DataGrid
                apiRef={apiRef}
                rows={pageInfo.rows}
                columns={getColumns(statuses)}

                paginationMode='server'
                paginationModel={paginationModel}
                rowCount={rowCountState}
                onPaginationModelChange={setPaginationModel}

                sortingMode='server'
                sortModel={sortModel}
                onSortModelChange={setSortModel}

                pageSizeOptions={[5, 10, 25, 100]}
                checkboxSelection
                onRowSelectionModelChange={setRowSelectionModel}
                disableRowSelectionOnClick
            />
        </Box>
    );
}

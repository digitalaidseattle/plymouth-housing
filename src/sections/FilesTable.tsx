import { useState } from 'react';
import { Button } from '@mui/material';

// material-ui
import {
    Box,
    SortDirection,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow
} from '@mui/material';
import { File } from '../services/storageService';


// ==============================|| HEADER CELL ||============================== //

const headCells = [
    {
        id: 'fileName',
        align: 'left',
        disablePadding: false,
        label: 'File Name.'
    },
    {
        id: 'fileType',
        align: 'left',
        disablePadding: true,
        label: 'File Type'
    },
    {
        id: 'fileSize',
        align: 'left',
        disablePadding: true,
        label: 'File Size'
    },
    {
        id: 'created_at',
        align: 'left',
        disablePadding: true,
        label: 'Created at'
    }
];

// ==============================|| File TABLE - HEADER ||============================== //
type FileTableHeadProps = {
    order: SortDirection,
    orderBy: string
};
const FileTableHead: React.FC<FileTableHeadProps> = ({ order, orderBy }) => {
    return (
        <TableHead>
            <TableRow>
                {headCells.map((headCell) => (
                    <TableCell
                        key={headCell.id}
                        align={headCell.align as "left" | "right" | "center" | "justify" | "inherit" | undefined}
                        padding={headCell.disablePadding ? 'none' : 'normal'}
                        sortDirection={orderBy === headCell.id ? order : 'desc'}
                    >
                        {headCell.label}
                    </TableCell>
                ))}
            </TableRow>
        </TableHead>
    );
}



// ==============================|| FILES TABLE ||============================== //

export default function FilesTable(props: { fileList: any, onDelete: Function }) {
    const [order] = useState<SortDirection>('desc');
    const [orderBy] = useState<string>('id');

    return (
        <Box>
            <TableContainer
                sx={{
                    width: '100%',
                    overflowX: 'auto',
                    position: 'relative',
                    display: 'block',
                    maxWidth: '100%',
                    '& td, & th': { whiteSpace: 'nowrap' }
                }}
            >
                <Table
                    aria-labelledby="tableTitle"
                    sx={{
                        '& .MuiTableCell-root:first-of-type': {
                            pl: 2
                        },
                        '& .MuiTableCell-root:last-of-type': {
                            pr: 3
                        }
                    }}
                >
                    <FileTableHead order={order} orderBy={orderBy} />
                    <TableBody>
                        {props.fileList
                            .map((file: File, id: number) => {
                                return (
                                    <TableRow
                                        hover
                                        role="checkbox"
                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                        tabIndex={-1}
                                        key={id}
                                    >
                                        <TableCell align="left">{file.name}</TableCell>
                                        <TableCell align="left">{file.metadata.mimetype}</TableCell>
                                        <TableCell align="left">{file.metadata.size}</TableCell>
                                        <TableCell align="left">{file.created_at}</TableCell>
                                        <TableCell align="left"><Button variant="contained" color="primary" component="span" onClick={() => props.onDelete(file.name)}>Delete</Button></TableCell>
                                    </TableRow>
                                );
                            })}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  Pagination,
  Paper,
  SelectChangeEvent,
  Chip,
  IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { useNavigate } from 'react-router-dom';

type Volunteer = {
  id: number;
  name: string;
  active: boolean;
  last_signed_in: string;
};

const VOLUNTEERS_API = '/data-api/rest/volunteer';

const People = () => {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [totalVolunteers, setTotalVolunteers] = useState(0); // Total number of volunteers
  const [status, setStatus] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [itemsPerPage] = useState(10); // Number of items per page
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationCursors, setPaginationCursors] = useState<string[]>([]); // Store Base64 cursors
  const navigate = useNavigate();

  // Fetch total number of volunteers to calculate total pages only once
  useEffect(() => {
    fetchTotalVolunteers();
  }, []);

  // Fetch data whenever page, status, or sort order changes
  useEffect(() => {
    fetchVolunteers();
  }, [status, sortOrder, currentPage]);

  // Fetch the total count of volunteers for pagination calculation
  const fetchTotalVolunteers = async () => {
    const queryParams = new URLSearchParams();
    if (status) {
      queryParams.set('$filter', `active eq ${status === 'active'}`);
    }

    try {
      const response = await fetch(`${VOLUNTEERS_API}?${queryParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch total count');
      }
      const data = await response.json();
      setTotalVolunteers(data.value.length);
    } catch (error) {
      console.error('Error fetching total volunteers count:', error);
    }
  };

  // Fetch volunteers with correct sorting and pagination
const fetchVolunteers = async () => {
  const filterClauses = [];
  if (status) filterClauses.push(`active eq ${status === 'active'}`);
  const filter = filterClauses.join(' and ');

  const queryParams = new URLSearchParams({
    $orderby: `name ${sortOrder}`,
    $first: itemsPerPage.toString(),
  });

  // Use cursor-based pagination
  const cursor = paginationCursors[currentPage - 1];
  if (cursor) {
    queryParams.set('$after', cursor);
  }

  if (filter) queryParams.set('$filter', filter);

  try {
    const response = await fetch(`${VOLUNTEERS_API}?${queryParams}`);
    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }
    const data = await response.json();
    setVolunteers(data.value);

    // Update the cursor for the next page
    if (data.nextLink) {
      const nextCursor = new URL(data.nextLink).searchParams.get("$after");
      if (nextCursor) {
        setPaginationCursors((prev) => {
          const updatedCursors = [...prev];
          updatedCursors[currentPage] = nextCursor; // Store cursor for the next page
          return updatedCursors;
        });
      }
    }
  } catch (error) {
    console.error('Error fetching volunteers:', error);
  }
};


  const handleStatusChange = (event: SelectChangeEvent<string>) => {
    setStatus(event.target.value as string);
    setCurrentPage(1); // Reset to the first page
    setPaginationCursors([]); // Reset cursors when status changes
  };

  const handleSort = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    setCurrentPage(1); // Reset to the first page on sort change
    setPaginationCursors([]); // Reset cursors when sort order changes
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
  };

  const totalPages = Math.ceil(totalVolunteers / itemsPerPage); // Calculate total pages

  return (
    <Box>
      {/* Add button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate('/add-volunteer')}
        >
          Add
        </Button>
      </Box>

      {/* Filter */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Select
          value={status}
          onChange={handleStatusChange}
          displayEmpty
          variant="outlined"
          size="small"
          sx={{ minWidth: 120 }}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="active">Active</MenuItem>
          <MenuItem value="inactive">Inactive</MenuItem>
        </Select>
      </Box>

      {/* Volunteers Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell onClick={handleSort} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                Name
                {sortOrder === 'asc' ? (
                  <ArrowUpwardIcon fontSize="small" sx={{ ml: 0.5, color: 'gray' }} />
                ) : (
                  <ArrowDownwardIcon fontSize="small" sx={{ ml: 0.5, color: 'gray' }} />
                )}
              </TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Last Signed In Date</TableCell>
              <TableCell>
                <MoreVertIcon />
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {volunteers.map((volunteer) => (
              <TableRow key={volunteer.id}>
                <TableCell>{volunteer.name}</TableCell>
                <TableCell>
                  <Chip
                    label={volunteer.active ? 'Active' : 'Inactive'}
                    sx={{
                      backgroundColor: volunteer.active ? '#E6F4EA' : '#FDECEA',
                      color: volunteer.active ? '#357A38' : '#D32F2F',
                      borderRadius: '8px',
                      px: 1.5,
                    }}
                  />
                </TableCell>
                <TableCell>{new Date(volunteer.last_signed_in).toLocaleDateString()}</TableCell>
                <TableCell>
                  <IconButton>
                    <MoreVertIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination Controls */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Pagination
          count={totalPages}
          page={currentPage}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>
    </Box>
  );
};

export default People;

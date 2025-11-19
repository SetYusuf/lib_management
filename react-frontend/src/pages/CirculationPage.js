import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  useTheme
} from '@mui/material';
import dayjs from 'dayjs';
import api from '../config/api';
import WarningIcon from '@mui/icons-material/Warning';
import RefreshIcon from '@mui/icons-material/Refresh';
import InfoIcon from '@mui/icons-material/Info';

const CirculationPage = () => {
  const theme = useTheme();
  const [loans, setLoans] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [overdueLoans, setOverdueLoans] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openRenewDialog, setOpenRenewDialog] = useState(false);
  const [openReservationDialog, setOpenReservationDialog] = useState(false);
  const [openFineDialog, setOpenFineDialog] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [selectedMemberForFines, setSelectedMemberForFines] = useState(null);
  const [memberFines, setMemberFines] = useState([]);
  const [members, setMembers] = useState([]);
  const [books, setBooks] = useState([]);
  const [selectedMember, setSelectedMember] = useState('');
  const [selectedBook, setSelectedBook] = useState('');
  const [loanDate, setLoanDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [dueDate, setDueDate] = useState(dayjs().add(14, 'day').format('YYYY-MM-DD'));
  const [newDueDate, setNewDueDate] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchLoans();
    fetchMembers();
    fetchBooks();
    fetchReservations();
    fetchOverdueBooks();
  }, []);

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const response = await api.get('/circulation');
      setLoans(response.data.circulation || []);
    } catch (error) {
      console.error('Error fetching loans:', error);
      showSnackbar('Error fetching loans: ' + (error.response?.data?.message || error.message), 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchReservations = async () => {
    try {
      const response = await api.get('/circulation/reservations');
      setReservations(response.data.reservations || []);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    }
  };

  const fetchOverdueBooks = async () => {
    try {
      const response = await api.get('/circulation/overdue');
      setOverdueLoans(response.data.overdueBooks || []);
    } catch (error) {
      console.error('Error fetching overdue books:', error);
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await api.get('/api/members');
      setMembers(response.data);
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  const fetchBooks = async () => {
    try {
      const response = await api.get('/api/books');
      setBooks(response.data);
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  };

  const fetchMemberFines = async (memberId) => {
    try {
      const response = await api.get(`/circulation/fines/member/${memberId}`);
      setMemberFines(response.data.fines || []);
    } catch (error) {
      console.error('Error fetching member fines:', error);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCreateLoan = async () => {
    if (!selectedMember || !selectedBook) {
      showSnackbar('Please select both member and book', 'error');
      return;
    }

    try {
      const response = await api.post('/circulation/borrow', {
        memberId: parseInt(selectedMember),
        bookId: parseInt(selectedBook),
        dueDate: dueDate
      });

      showSnackbar('Loan created successfully', 'success');
      if (response.data.receipt) {
        console.log('Receipt:', response.data.receipt);
      }
      setOpenDialog(false);
      setSelectedMember('');
      setSelectedBook('');
      setLoanDate(dayjs().format('YYYY-MM-DD'));
      setDueDate(dayjs().add(14, 'day').format('YYYY-MM-DD'));
      fetchLoans();
      fetchBooks();
    } catch (error) {
      console.error('Error creating loan:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error creating loan';
      showSnackbar(errorMessage, 'error');
    }
  };

  const handleReturnLoan = async (loanId) => {
    try {
      const response = await api.put(`/circulation/return/${loanId}`);
      let message = 'Book returned successfully';
      if (response.data.fine) {
        message += `. Fine of $${response.data.fine.amount.toFixed(2)} added (${response.data.fine.daysOverdue} days overdue)`;
      }
      showSnackbar(message, 'success');
      fetchLoans();
      fetchBooks();
      fetchReservations();
    } catch (error) {
      console.error('Error returning loan:', error);
      showSnackbar(error.response?.data?.message || 'Error returning book', 'error');
    }
  };

  const handleRenewLoan = async () => {
    if (!selectedLoan || !newDueDate) {
      showSnackbar('Please select a new due date', 'error');
      return;
    }

    try {
      await api.put(`/circulation/renew/${selectedLoan.id}`, {
        newDueDate: newDueDate
      });
      showSnackbar(`Loan renewed successfully. Renewal count: ${selectedLoan.renewalCount + 1}`, 'success');
      setOpenRenewDialog(false);
      setSelectedLoan(null);
      setNewDueDate('');
      fetchLoans();
    } catch (error) {
      console.error('Error renewing loan:', error);
      showSnackbar(error.response?.data?.message || 'Error renewing loan', 'error');
    }
  };

  const handleCreateReservation = async () => {
    if (!selectedMember || !selectedBook) {
      showSnackbar('Please select both member and book', 'error');
      return;
    }

    try {
      const response = await api.post('/circulation/reservations', {
        memberId: parseInt(selectedMember),
        bookId: parseInt(selectedBook)
      });
      showSnackbar(response.data.message || 'Reservation created successfully', 'success');
      setOpenReservationDialog(false);
      setSelectedMember('');
      setSelectedBook('');
      fetchReservations();
      fetchBooks();
    } catch (error) {
      console.error('Error creating reservation:', error);
      showSnackbar(error.response?.data?.message || 'Error creating reservation', 'error');
    }
  };

  const handleCancelReservation = async (reservationId) => {
    try {
      await api.delete(`/circulation/reservations/${reservationId}`);
      showSnackbar('Reservation cancelled successfully', 'success');
      fetchReservations();
      fetchBooks();
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      showSnackbar(error.response?.data?.message || 'Error cancelling reservation', 'error');
    }
  };

  const handlePayFine = async (fineId, amount) => {
    try {
      const response = await api.put(`/circulation/fines/${fineId}/pay`, { amount });
      showSnackbar(`Fine paid successfully. Remaining balance: $${response.data.remainingBalance.toFixed(2)}`, 'success');
      if (selectedMemberForFines) {
        fetchMemberFines(selectedMemberForFines.id);
      }
      fetchMembers();
    } catch (error) {
      console.error('Error paying fine:', error);
      showSnackbar(error.response?.data?.message || 'Error paying fine', 'error');
    }
  };

  const handleWaiveFine = async (fineId) => {
    try {
      const response = await api.put(`/circulation/fines/${fineId}/waive`);
      showSnackbar(`Fine waived successfully. Remaining balance: $${response.data.remainingBalance.toFixed(2)}`, 'success');
      if (selectedMemberForFines) {
        fetchMemberFines(selectedMemberForFines.id);
      }
      fetchMembers();
    } catch (error) {
      console.error('Error waiving fine:', error);
      showSnackbar(error.response?.data?.message || 'Error waiving fine', 'error');
    }
  };

  const openRenewDialogHandler = (loan) => {
    setSelectedLoan(loan);
    setNewDueDate(dayjs(loan.dueDate).add(14, 'day').format('YYYY-MM-DD'));
    setOpenRenewDialog(true);
  };

  const openFineDialogHandler = async (member) => {
    setSelectedMemberForFines(member);
    await fetchMemberFines(member.id);
    setOpenFineDialog(true);
  };

  const getStatusColor = (status, isOverdue) => {
    if (isOverdue) return 'error';
    switch (status) {
      case 'Borrowed':
        return 'success';
      case 'Returned':
        return 'default';
      case 'Overdue':
        return 'error';
      default:
        return 'default';
    }
  };

  const isOverdue = (dueDate, status) => {
    return status === 'Borrowed' && dayjs().isAfter(dayjs(dueDate));
  };

  const getFilteredLoans = () => {
    if (filterStatus === 'all') return loans;
    if (filterStatus === 'active') return loans.filter(l => l.status === 'Borrowed');
    if (filterStatus === 'returned') return loans.filter(l => l.status === 'Returned');
    if (filterStatus === 'overdue') return loans.filter(l => isOverdue(l.dueDate, l.status));
    return loans;
  };

  const selectedMemberData = members.find(m => m.id === parseInt(selectedMember));
  const selectedBookData = books.find(b => b.id === parseInt(selectedBook));

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
            Circulation Management
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => {
                fetchLoans();
                fetchReservations();
                fetchOverdueBooks();
              }}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              sx={{
                textTransform: 'none',
                fontWeight: '600'
              }}
              onClick={() => setOpenDialog(true)}
            >
              New Loan
            </Button>
          </Box>
        </Box>

      {/* Statistics Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Active Loans
              </Typography>
              <Typography variant="h4">
                {loans.filter(l => l.status === 'Borrowed').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Overdue Books
              </Typography>
              <Typography variant="h4" color="error">
                {overdueLoans.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Reservations
              </Typography>
              <Typography variant="h4">
                {reservations.filter(r => r.status === 'Pending' || r.status === 'Available').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Loans
              </Typography>
              <Typography variant="h4">
                {loans.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab label="All Loans" />
            <Tab label="Reservations" />
            <Tab label="Overdue Books" />
          </Tabs>
        </Box>

        {/* All Loans Tab */}
        {tabValue === 0 && (
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: '600' }}>
                Loans
              </Typography>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Filter</InputLabel>
                <Select
                  value={filterStatus}
                  label="Filter"
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="returned">Returned</MenuItem>
                  <MenuItem value="overdue">Overdue</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Book</TableCell>
                    <TableCell>Member</TableCell>
                    <TableCell>Loan Date</TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Renewals</TableCell>
                    <TableCell>Fine</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getFilteredLoans().map((loan) => {
                    const overdue = isOverdue(loan.dueDate, loan.status);
                    const status = overdue ? 'Overdue' : loan.status;
                    const daysOverdue = overdue && loan.daysOverdue ? loan.daysOverdue : (overdue ? dayjs().diff(dayjs(loan.dueDate), 'day') : 0);
                    return (
                      <TableRow key={loan.id} sx={{ bgcolor: overdue ? 'error.light' : 'inherit' }}>
                        <TableCell>{loan.book?.title || 'Unknown'}</TableCell>
                        <TableCell>
                          <Box>
                            {loan.member?.name || 'Unknown'}
                            {(parseFloat(loan.member?.fineBalance) || 0) > 0 && (
                              <Tooltip title={`Unpaid fines: $${(parseFloat(loan.member.fineBalance) || 0).toFixed(2)}`}>
                                <WarningIcon color="error" sx={{ ml: 1, fontSize: 16 }} />
                              </Tooltip>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>{dayjs(loan.loanDate).format('MMM DD, YYYY')}</TableCell>
                        <TableCell>
                          <Box>
                            {dayjs(loan.dueDate).format('MMM DD, YYYY')}
                            {overdue && (
                              <Typography variant="caption" color="error" display="block">
                                {daysOverdue} days overdue
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={status}
                            color={getStatusColor(status, overdue)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{loan.renewalCount || 0}</TableCell>
                        <TableCell>
                          {loan.fineAmount > 0 ? `$${parseFloat(loan.fineAmount).toFixed(2)}` : '-'}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {loan.status === 'Borrowed' && (
                              <>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={() => handleReturnLoan(loan.id)}
                                >
                                  Return
                                </Button>
                                {loan.renewalCount < 2 && (
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    color="primary"
                                    onClick={() => openRenewDialogHandler(loan)}
                                  >
                                    Renew
                                  </Button>
                                )}
                              </>
                            )}
                            <Button
                              size="small"
                              variant="outlined"
                              color="info"
                              onClick={() => openFineDialogHandler(loan.member)}
                            >
                              Fines
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {getFilteredLoans().length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        <Typography color="textSecondary">No loans found</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        )}

        {/* Reservations Tab */}
        {tabValue === 1 && (
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: '600' }}>
                Reservations
              </Typography>
              <Button
                variant="contained"
                size="small"
                onClick={() => setOpenReservationDialog(true)}
              >
                New Reservation
              </Button>
            </Box>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Book</TableCell>
                    <TableCell>Member</TableCell>
                    <TableCell>Reservation Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reservations.filter(r => r.status !== 'Cancelled' && r.status !== 'Fulfilled').map((reservation) => (
                    <TableRow key={reservation.id}>
                      <TableCell>{reservation.book?.title || 'Unknown'}</TableCell>
                      <TableCell>{reservation.member?.name || 'Unknown'}</TableCell>
                      <TableCell>{dayjs(reservation.reservationDate).format('MMM DD, YYYY')}</TableCell>
                      <TableCell>
                        <Chip
                          label={reservation.status}
                          color={reservation.status === 'Available' ? 'success' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() => handleCancelReservation(reservation.id)}
                        >
                          Cancel
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {reservations.filter(r => r.status !== 'Cancelled' && r.status !== 'Fulfilled').length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Typography color="textSecondary">No active reservations</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        )}

        {/* Overdue Books Tab */}
        {tabValue === 2 && (
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: '600', mb: 2 }}>
              Overdue Books
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Book</TableCell>
                    <TableCell>Member</TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell>Days Overdue</TableCell>
                    <TableCell>Fine Amount</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {overdueLoans.map((loan) => (
                    <TableRow key={loan.id} sx={{ bgcolor: 'error.light' }}>
                      <TableCell>{loan.book?.title || 'Unknown'}</TableCell>
                      <TableCell>{loan.member?.name || 'Unknown'}</TableCell>
                      <TableCell>{dayjs(loan.dueDate).format('MMM DD, YYYY')}</TableCell>
                      <TableCell>
                        <Typography color="error" fontWeight="bold">
                          {loan.daysOverdue} days
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography color="error" fontWeight="bold">
                          ${loan.fineAmount?.toFixed(2) || '0.00'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleReturnLoan(loan.id)}
                        >
                          Return
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {overdueLoans.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Typography color="textSecondary">No overdue books</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        )}
      </Card>

      {/* Create Loan Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Loan</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              select
              value={selectedMember}
              onChange={(e) => setSelectedMember(e.target.value)}
              fullWidth
              SelectProps={{ native: true }}
            >
              <option value="">Select a member</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name} {(parseFloat(member.fineBalance) || 0) > 0 ? `(Fines: $${(parseFloat(member.fineBalance) || 0).toFixed(2)})` : ''}
                </option>
              ))}
            </TextField>

            {selectedMemberData && (
              <Box sx={{ p: 2, bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)', borderRadius: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                  Member Information:
                </Typography>
                <Typography variant="body2">Name: {selectedMemberData.name}</Typography>
                <Typography variant="body2">Email: {selectedMemberData.email || 'N/A'}</Typography>
                <Typography variant="body2" color={(parseFloat(selectedMemberData.fineBalance) || 0) > 0 ? 'error' : 'text.secondary'}>
                  Fine Balance: ${(parseFloat(selectedMemberData.fineBalance) || 0).toFixed(2)}
                </Typography>
                <Typography variant="body2">
                  Max Books: {selectedMemberData.maxBooksLimit || 5}
                </Typography>
                {(parseFloat(selectedMemberData.fineBalance) || 0) > 0 && (
                  <Alert severity="warning" sx={{ mt: 1 }}>
                    Member has unpaid fines. Borrowing may be blocked.
                  </Alert>
                )}
              </Box>
            )}

            <TextField
              select
              value={selectedBook}
              onChange={(e) => setSelectedBook(e.target.value)}
              fullWidth
              SelectProps={{ native: true }}
            >
              <option value="">Select a book</option>
              {books.filter(b => b.status !== 'Lost' && b.status !== 'Damaged').map((book) => (
                <option key={book.id} value={book.id}>
                  {book.title} - {book.status} (Qty: {book.quantity})
                </option>
              ))}
            </TextField>

            {selectedBookData && (
              <Box sx={{ p: 2, bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)', borderRadius: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                  Book Information:
                </Typography>
                <Typography variant="body2">Title: {selectedBookData.title}</Typography>
                {selectedBookData.author && (
                  <Typography variant="body2">Author: {selectedBookData.author}</Typography>
                )}
                <Typography variant="body2">Status: {selectedBookData.status}</Typography>
                <Typography variant="body2">Available: {selectedBookData.quantity}</Typography>
              </Box>
            )}

            <TextField
              label="Loan Date"
              type="date"
              value={loanDate}
              onChange={(e) => setLoanDate(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="Due Date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateLoan} variant="contained">
            Create Loan
          </Button>
        </DialogActions>
      </Dialog>

      {/* Renew Loan Dialog */}
      <Dialog open={openRenewDialog} onClose={() => setOpenRenewDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Renew Loan</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            {selectedLoan && (
              <>
                <Typography variant="body2">
                  <strong>Book:</strong> {selectedLoan.book?.title || 'Unknown'}
                </Typography>
                <Typography variant="body2">
                  <strong>Member:</strong> {selectedLoan.member?.name || 'Unknown'}
                </Typography>
                <Typography variant="body2">
                  <strong>Current Due Date:</strong> {dayjs(selectedLoan.dueDate).format('MMM DD, YYYY')}
                </Typography>
                <Typography variant="body2">
                  <strong>Renewals Used:</strong> {selectedLoan.renewalCount || 0} / 2
                </Typography>
                <TextField
                  label="New Due Date"
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRenewDialog(false)}>Cancel</Button>
          <Button onClick={handleRenewLoan} variant="contained" disabled={!newDueDate}>
            Renew
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Reservation Dialog */}
      <Dialog open={openReservationDialog} onClose={() => setOpenReservationDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Reservation</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              select
              value={selectedMember}
              onChange={(e) => setSelectedMember(e.target.value)}
              fullWidth
              SelectProps={{ native: true }}
            >
              <option value="">Select a member</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </TextField>

            {selectedMemberData && (
              <Box sx={{ p: 2, bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)', borderRadius: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                  Selected Member: {selectedMemberData.name}
                </Typography>
              </Box>
            )}

            <TextField
              select
              value={selectedBook}
              onChange={(e) => setSelectedBook(e.target.value)}
              fullWidth
              SelectProps={{ native: true }}
            >
              <option value="">Select a book</option>
              {books.map((book) => (
                <option key={book.id} value={book.id}>
                  {book.title} - {book.status}
                </option>
              ))}
            </TextField>

            {selectedBookData && (
              <Box sx={{ p: 2, bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)', borderRadius: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                  Selected Book: {selectedBookData.title}
                </Typography>
                {selectedBookData.author && (
                  <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                    Author: {selectedBookData.author}
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenReservationDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateReservation} variant="contained">
            Create Reservation
          </Button>
        </DialogActions>
      </Dialog>

      {/* Fine Management Dialog */}
      <Dialog open={openFineDialog} onClose={() => setOpenFineDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Fine Management - {selectedMemberForFines?.name || 'Member'}
        </DialogTitle>
        <DialogContent>
          {selectedMemberForFines && (
            <Box sx={{ mb: 2, p: 2, bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)', borderRadius: 1 }}>
              <Typography variant="body2">
                <strong>Total Fine Balance:</strong> ${(parseFloat(selectedMemberForFines.fineBalance) || 0).toFixed(2)}
              </Typography>
            </Box>
          )}
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Reason</TableCell>
                  <TableCell>Days Overdue</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {memberFines.map((fine) => (
                  <TableRow key={fine.id}>
                    <TableCell>{dayjs(fine.createdAt).format('MMM DD, YYYY')}</TableCell>
                    <TableCell>${parseFloat(fine.amount).toFixed(2)}</TableCell>
                    <TableCell>{fine.reason || 'Overdue'}</TableCell>
                    <TableCell>{fine.daysOverdue || '-'}</TableCell>
                    <TableCell>
                      <Chip
                        label={fine.status}
                        color={fine.status === 'Paid' ? 'success' : fine.status === 'Waived' ? 'default' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {fine.status === 'Pending' && (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            size="small"
                            variant="outlined"
                            color="success"
                            onClick={() => handlePayFine(fine.id, fine.amount)}
                          >
                            Pay
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="warning"
                            onClick={() => handleWaiveFine(fine.id)}
                          >
                            Waive
                          </Button>
                        </Box>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {memberFines.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography color="textSecondary">No fines found</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenFineDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CirculationPage;

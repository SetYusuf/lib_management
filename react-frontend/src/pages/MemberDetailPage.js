import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Snackbar, Alert, useTheme } from '@mui/material';

const MemberDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const [member, setMember] = useState(null);
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [books, setBooks] = useState([]);
  const [addLoanOpen, setAddLoanOpen] = useState(false);
  const [newLoan, setNewLoan] = useState({ bookId: '', loanDate: '', dueDate: '' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const load = async () => {
      try {
        const [mRes, lRes, bRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/members/${id}`),
          axios.get(`${API_BASE_URL}/api/members/${id}/loans`),
          axios.get(`${API_BASE_URL}/api/books`),
        ]);
        setMember(mRes.data);
        setLoans(lRes.data);
        setBooks(bRes.data);
      } catch (e) {
        console.error('Error loading member detail:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
        <CircularProgress />
      </Box>
    );
  }

  const openAddLoan = () => setAddLoanOpen(true);
  const closeAddLoan = () => setAddLoanOpen(false);

  const handleLoanChange = (e) => {
    const { name, value } = e.target;
    setNewLoan((prev) => ({ ...prev, [name]: value }));
  };

  const refreshLoans = async () => {
    try {
      const lRes = await axios.get(`${API_BASE_URL}/api/members/${id}/loans`);
      setLoans(lRes.data);
    } catch (e) {
      console.error('Error refreshing loans:', e);
    }
  };

  const handleCreateLoan = async () => {
    if (!newLoan.bookId) {
      setSnackbar({ open: true, message: 'Please select a book', severity: 'warning' });
      return;
    }
    try {
      await axios.post(`${API_BASE_URL}/api/loans`, {
        memberId: Number(id),
        bookId: Number(newLoan.bookId),
        loanDate: newLoan.loanDate || undefined,
        dueDate: newLoan.dueDate || undefined,
      });
      setSnackbar({ open: true, message: 'Loan created', severity: 'success' });
      setNewLoan({ bookId: '', loanDate: '', dueDate: '' });
      setAddLoanOpen(false);
      refreshLoans();
    } catch (e) {
      console.error('Error creating loan:', e);
      setSnackbar({ open: true, message: 'Error creating loan', severity: 'error' });
    }
  };

  return (
    <Box sx={{ padding: '24px', backgroundColor: theme.palette.background.default, minHeight: 'calc(100vh - 64px)' }}>
      <Box sx={{ backgroundColor: theme.palette.background.paper, borderRadius: '8px', padding: '24px', boxShadow: theme.shadows[2] }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ fontSize: '28px', fontWeight: 'bold', color: theme.palette.text.primary }}>
            Member Detail
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="contained" onClick={openAddLoan} sx={{ textTransform: 'none', borderRadius: '8px' }}>
              Add Loan
            </Button>
            <Button variant="outlined" onClick={() => navigate('/members')} sx={{ textTransform: 'none', borderRadius: '8px' }}>
              Back to Members
            </Button>
          </Box>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>{member?.name || 'Unknown Member'}</Typography>
          <Typography sx={{ color: theme.palette.text.secondary }}>Membership ID: {member?.membershipId || '—'}</Typography>
          <Typography sx={{ color: theme.palette.text.secondary }}>Email: {member?.email || '—'} | Phone: {member?.phone || '—'}</Typography>
          <Typography sx={{ color: theme.palette.text.secondary }}>Status: {member?.status || '—'}</Typography>
        </Box>

        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Loans</Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Book Title</TableCell>
                <TableCell>Book Code (ISBN)</TableCell>
                <TableCell>Loan Date</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loans.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ padding: '32px' }}>
                    No loans found
                  </TableCell>
                </TableRow>
              ) : (
                loans.map((loan) => (
                  <TableRow key={loan.id}>
                    <TableCell>{loan.book?.title || '—'}</TableCell>
                    <TableCell>{loan.book?.isbn || '—'}</TableCell>
                    <TableCell>{loan.loanDate || '—'}</TableCell>
                    <TableCell>{loan.dueDate || '—'}</TableCell>
                    <TableCell>{loan.status}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Dialog open={addLoanOpen} onClose={closeAddLoan} fullWidth maxWidth="sm">
        <DialogTitle>Add Loan</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Book"
              name="bookId"
              value={newLoan.bookId}
              onChange={handleLoanChange}
              fullWidth
              select
              required
            >
              {books.map((b) => (
                <MenuItem key={b.id} value={b.id}>
                  {b.title} {b.isbn ? `(${b.isbn})` : ''}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Loan Date"
              name="loanDate"
              value={newLoan.loanDate}
              onChange={handleLoanChange}
              type="date"
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label="Due Date"
              name="dueDate"
              value={newLoan.dueDate}
              onChange={handleLoanChange}
              type="date"
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeAddLoan}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateLoan} sx={{ textTransform: 'none' }}>Create Loan</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MemberDetailPage;

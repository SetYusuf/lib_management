// src/components/BookList.js

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Snackbar,
  Alert,
  useTheme,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const BookList = ({ searchTerm = '', filters = {} }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [books, setBooks] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchBooks = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/books`);
      setBooks(response.data);
    } catch (error) {
      console.error('Error fetching books:', error);
      setSnackbar({ open: true, message: 'Error loading books', severity: 'error' });
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleMenuOpen = (event, book) => {
    setAnchorEl(event.currentTarget);
    setSelectedBook(book);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedBook(null);
  };

  const handleEdit = () => {
    if (selectedBook) {
      navigate(`/add-book/${selectedBook.id}`);
    }
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
    // Close only the menu anchor, keep the selectedBook for the dialog actions
    setAnchorEl(null);
  };

  const handleDeleteConfirm = async () => {
    if (selectedBook) {
      try {
        await axios.delete(`${API_BASE_URL}/api/books/${selectedBook.id}`);
        setSnackbar({ open: true, message: 'Book deleted successfully', severity: 'success' });
        fetchBooks(); // Refresh the list
      } catch (error) {
        console.error('Error deleting book:', error);
        setSnackbar({ open: true, message: 'Error deleting book', severity: 'error' });
      }
    }
    setDeleteDialogOpen(false);
    setSelectedBook(null);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedBook(null);
  };

  const filteredBooks = books.filter((book) => {
    // Search filter
    if (searchTerm) {
      const titleWords = book.title.toLowerCase().split(' ');
      const lowercaseSearchTerm = searchTerm.toLowerCase();
      const matchesSearch = titleWords.some((word) =>
        word.startsWith(lowercaseSearchTerm)
      );
      if (!matchesSearch) return false;
    }

    // Genre filter (OR logic - if any selected genre matches, include the book)
    if (filters.genre) {
      const hasActiveGenreFilter =
        filters.genre.fiction ||
        filters.genre.nonfiction ||
        filters.genre.adventure ||
        filters.genre.biography ||
        filters.genre.science ||
        filters.genre.history;
      
      if (hasActiveGenreFilter) {
        const bookGenre = (book.genre || '').toLowerCase();
        let genreMatches = false;
        
        if (filters.genre.fiction && (bookGenre === 'fiction' || bookGenre.includes('fiction'))) {
          genreMatches = true;
        }
        if (filters.genre.nonfiction && (bookGenre === 'non-fiction' || bookGenre === 'nonfiction' || bookGenre.includes('non-fiction'))) {
          genreMatches = true;
        }
        if (filters.genre.adventure && (bookGenre === 'adventure' || bookGenre.includes('adventure'))) {
          genreMatches = true;
        }
        if (filters.genre.biography && (bookGenre === 'biography' || bookGenre.includes('biography'))) {
          genreMatches = true;
        }
        if (filters.genre.science && (bookGenre === 'science' || bookGenre.includes('science'))) {
          genreMatches = true;
        }
        if (filters.genre.history && (bookGenre === 'history' || bookGenre.includes('history'))) {
          genreMatches = true;
        }
        
        if (!genreMatches) return false;
      }
    }

    // Status filter (OR logic - if any selected status matches, include the book)
    if (filters.status) {
      const hasActiveStatusFilter =
        filters.status.available ||
        filters.status.loaned ||
        filters.status.reserved ||
        filters.status.lost ||
        filters.status.damaged;
      
      if (hasActiveStatusFilter) {
        const bookStatus = (book.status || 'Available');
        let statusMatches = false;
        
        if (filters.status.available && bookStatus === 'Available') statusMatches = true;
        if (filters.status.loaned && bookStatus === 'Loaned') statusMatches = true;
        if (filters.status.reserved && bookStatus === 'Reserved') statusMatches = true;
        if (filters.status.lost && bookStatus === 'Lost') statusMatches = true;
        if (filters.status.damaged && bookStatus === 'Damaged') statusMatches = true;
        
        if (!statusMatches) return false;
      }
    }

    // Publication Date filter (OR logic - if any selected range matches, include the book)
    if (filters.publicationDate) {
      const hasActiveDateFilter =
        filters.publicationDate.before2000 ||
        filters.publicationDate['2000-2010'] ||
        filters.publicationDate['2011-2020'] ||
        filters.publicationDate.after2020;
      
      if (hasActiveDateFilter) {
        const pubDate = book.publicationDate || '';
        const year = parseInt(pubDate);
        
        if (isNaN(year)) {
          // If no valid year, exclude if any date filter is active
          return false;
        }
        
        let dateMatches = false;
        
        if (filters.publicationDate.before2000 && year < 2000) {
          dateMatches = true;
        }
        if (filters.publicationDate['2000-2010'] && year >= 2000 && year <= 2010) {
          dateMatches = true;
        }
        if (filters.publicationDate['2011-2020'] && year >= 2011 && year <= 2020) {
          dateMatches = true;
        }
        if (filters.publicationDate.after2020 && year > 2020) {
          dateMatches = true;
        }
        
        if (!dateMatches) return false;
      }
    }

    return true;
  });

  const getStatusColor = (status) => {
    const statusLower = (status || 'available').toLowerCase();
    if (statusLower === 'available') return '#4caf50';
    if (statusLower === 'loaned') return '#ff9800';
    return '#757575';
  };

  return (
    <TableContainer
      component={Paper}
      sx={{
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Table>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: '600', fontSize: '14px' }}>
              Title / Genre
            </TableCell>
            <TableCell sx={{ fontWeight: '600', fontSize: '14px' }}>
              Author / ISBN
            </TableCell>
            <TableCell sx={{ fontWeight: '600', fontSize: '14px' }}>
              ID / Quantity
            </TableCell>
            <TableCell
              align="right"
              sx={{ fontWeight: '600', fontSize: '14px' }}
            >
              Status
            </TableCell>
            <TableCell
              align="right"
              sx={{ fontWeight: '600', fontSize: '14px' }}
            >
              Actions
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredBooks.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} align="center" sx={{ padding: '40px' }}>
                No books found
              </TableCell>
            </TableRow>
          ) : (
            filteredBooks.map((book) => (
              <TableRow
                key={book.id}
                sx={{
                  '&:hover': {
                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                  },
                }}
              >
                <TableCell>
                  <Box>
                    <Box sx={{ fontWeight: '500', marginBottom: '4px', color: theme.palette.text.primary }}>
                      {book.title || 'N/A'}
                    </Box>
                    <Box sx={{ fontSize: '12px', color: theme.palette.text.secondary }}>
                      {book.genre || 'N/A'}
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box>
                    <Box sx={{ fontWeight: '500', marginBottom: '4px', color: theme.palette.text.primary }}>
                      {book.author || 'N/A'}
                    </Box>
                    <Box sx={{ fontSize: '12px', color: theme.palette.text.secondary }}>
                      ISBN: {book.isbn || 'N/A'}
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box>
                    <Box sx={{ fontWeight: '500', marginBottom: '4px', color: theme.palette.text.primary }}>
                      ID: {String(book.id || '').toString() || 'N/A'}
                    </Box>
                    <Box sx={{ fontSize: '12px', color: theme.palette.text.secondary }}>
                      Qty: {book.quantity || 0}
                    </Box>
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <Chip
                    label={book.status || 'Available'}
                    size="small"
                    sx={{
                      backgroundColor: getStatusColor(book.status),
                      color: '#ffffff',
                      fontWeight: '500',
                      fontSize: '11px',
                    }}
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuOpen(e, book)}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleEdit}>
          <EditIcon sx={{ marginRight: 1, fontSize: '18px' }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ marginRight: 1, fontSize: '18px' }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">Delete Book</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete "{selectedBook?.title}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            sx={{ textTransform: 'none' }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </TableContainer>
  );
};

export default BookList;

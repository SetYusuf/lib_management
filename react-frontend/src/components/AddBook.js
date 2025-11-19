import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  TextField,
  Button,
  Box,
  Typography,
  Grid,
  MenuItem,
  Alert,
  CircularProgress,
} from '@mui/material';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const AddBook = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    genre: '',
    quantity: 0,
    status: 'Available',
    publicationDate: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (isEditMode) {
      fetchBook();
    }
  }, [id]);

  const fetchBook = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/books/${id}`);
      setFormData(response.data);
    } catch (error) {
      console.error('Error fetching book:', error);
      setMessage({ type: 'error', text: 'Error loading book data' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'quantity' ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      if (isEditMode) {
        await axios.put(`${API_BASE_URL}/api/books/${id}`, formData);
        setMessage({ type: 'success', text: 'Book updated successfully!' });
      } else {
        await axios.post(`${API_BASE_URL}/api/books`, formData);
        setMessage({ type: 'success', text: 'Book added successfully!' });
        // Reset form
        setFormData({
          title: '',
          author: '',
          isbn: '',
          genre: '',
          quantity: 0,
          status: 'Available',
          publicationDate: '',
        });
      }

      // Navigate to book list after 1.5 seconds
      setTimeout(() => {
        navigate('/view-books');
      }, 1500);
    } catch (error) {
      console.error('Error:', error);
      let errorMessage = 'Error occurred. Please try again.';
      
      if (error.response) {
        // Server responded with error
        const responseData = error.response.data;
        if (responseData?.errors && Array.isArray(responseData.errors)) {
          errorMessage = `Validation errors: ${responseData.errors.join(', ')}`;
        } else {
          errorMessage = responseData?.message || `Server error: ${error.response.status}`;
        }
      } else if (error.request) {
        // Request made but no response (backend not running or network issue)
        errorMessage = `Cannot connect to server. Please make sure the backend server is running on ${API_BASE_URL}`;
      } else {
        // Something else happened
        errorMessage = error.message || 'An unexpected error occurred';
      }
      
      setMessage({
        type: 'error',
        text: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: '600', marginBottom: '24px' }}>
        {isEditMode ? 'Edit Book' : 'Add a New Book'}
      </Typography>

      {message.text && (
        <Alert severity={message.type} sx={{ mb: 3 }}>
          {message.text}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TextField
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            fullWidth
            required
            variant="outlined"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            label="Author"
            name="author"
            value={formData.author}
            onChange={handleChange}
            fullWidth
            required
            variant="outlined"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            label="ISBN"
            name="isbn"
            value={formData.isbn}
            onChange={handleChange}
            fullWidth
            variant="outlined"
            placeholder="978-0-123456-78-9"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            label="Genre"
            name="genre"
            value={formData.genre}
            onChange={handleChange}
            fullWidth
            select
            variant="outlined"
          >
            <MenuItem value="">Select Genre</MenuItem>
            <MenuItem value="Fiction">Fiction</MenuItem>
            <MenuItem value="Non-fiction">Non-fiction</MenuItem>
            <MenuItem value="Adventure">Adventure</MenuItem>
            <MenuItem value="Biography">Biography</MenuItem>
            <MenuItem value="Science">Science</MenuItem>
            <MenuItem value="History">History</MenuItem>
            <MenuItem value="Lost">Lost</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            label="Quantity"
            name="quantity"
            type="number"
            value={formData.quantity}
            onChange={handleChange}
            fullWidth
            variant="outlined"
            inputProps={{ min: 0 }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            label="Status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            fullWidth
            select
            variant="outlined"
          >
            <MenuItem value="Available">Available</MenuItem>
            <MenuItem value="Loaned">Loaned</MenuItem>
            <MenuItem value="Lost">Lost</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            label="Publication Date"
            name="publicationDate"
            value={formData.publicationDate}
            onChange={handleChange}
            fullWidth
            variant="outlined"
            placeholder="2001"
          />
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          sx={{
            borderRadius: '8px',
            padding: '10px 32px',
            textTransform: 'none',
            fontWeight: '600',
          }}
        >
          {loading ? <CircularProgress size={24} /> : isEditMode ? 'Update Book' : 'Add Book'}
        </Button>
        <Button
          variant="outlined"
          onClick={() => navigate('/view-books')}
          sx={{
            borderRadius: '8px',
            padding: '10px 32px',
            textTransform: 'none',
            fontWeight: '600',
          }}
        >
          Cancel
        </Button>
      </Box>
    </Box>
  );
};

export default AddBook;

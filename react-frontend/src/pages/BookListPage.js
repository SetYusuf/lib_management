// src/pages/BookListPage.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BookList from '../components/BookList';
import FilterPanel from '../components/FilterPanel';
import { Box, Typography, Button, useTheme } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useSearch } from '../context/SearchContext';

const BookListPage = () => {
  const navigate = useNavigate();
  const { searchTerm } = useSearch();
  const theme = useTheme();
  const [filters, setFilters] = useState({});

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  return (
    <Box
      sx={{
        padding: '24px',
        backgroundColor: theme.palette.background.default,
        minHeight: 'calc(100vh - 64px)',
      }}
    >
      <Box
        sx={{
          backgroundColor: theme.palette.background.paper,
          borderRadius: '8px',
          padding: '24px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontSize: '28px',
              fontWeight: 'bold',
              color: theme.palette.text.primary,
            }}
          >
            Catalogue
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/add-book')}
            sx={{
              borderRadius: '8px',
              padding: '10px 24px',
              textTransform: 'none',
              fontWeight: '600',
            }}
          >
            Add New Book
          </Button>
        </Box>

        {/* Filter Panel and Book List */}
        <Box sx={{ display: 'flex' }}>
          <FilterPanel onFilterChange={handleFilterChange} />
          <Box sx={{ flex: 1 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: theme.palette.text.primary,
                }}
              >
                All Books
              </Typography>
            </Box>
            <BookList searchTerm={searchTerm} filters={filters} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default BookListPage;

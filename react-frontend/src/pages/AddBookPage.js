import React from 'react';
import AddBook from '../components/AddBook';
import { Box, useTheme } from '@mui/material';

const AddBookPage = () => {
  const theme = useTheme();
  
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
          boxShadow: theme.shadows[2],
          maxWidth: '900px',
          margin: '0 auto',
        }}
      >
        <AddBook />
      </Box>
    </Box>
  );
};

export default AddBookPage;

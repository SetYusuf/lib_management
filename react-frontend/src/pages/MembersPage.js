// src/pages/MembersPage.js

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, useTheme } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import MemberList from '../components/MemberList';
import { useSearch } from '../context/SearchContext';

const MembersPage = () => {
  const navigate = useNavigate();
  const { searchTerm } = useSearch();
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
            Members
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/add-member')}
            sx={{
              borderRadius: '8px',
              padding: '10px 24px',
              textTransform: 'none',
              fontWeight: '600',
            }}
          >
            Add Member
          </Button>
        </Box>

        <MemberList searchTerm={searchTerm} />
      </Box>
    </Box>
  );
};

export default MembersPage;

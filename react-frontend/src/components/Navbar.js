import React from 'react';
import { Box, TextField, InputAdornment, Button, IconButton, useTheme } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import { useSearch } from '../context/SearchContext';

const Navbar = () => {
  const navigate = useNavigate();
  const { searchTerm, setSearchTerm } = useSearch();
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 24px',
        backgroundColor: theme.palette.background.paper,
        borderBottom: `1px solid ${theme.palette.divider}`,
        boxShadow: theme.shadows[1],
      }}
    >
      {/* Left: User icon and LIBRARY PRO */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <PersonIcon sx={{ color: theme.palette.primary.main, fontSize: '28px' }} />
        <Box
          sx={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: theme.palette.primary.main,
            letterSpacing: '1px',
          }}
        >
          LIBRARY KSK
        </Box>
      </Box>

      {/* Center: Search bar */}
      <Box sx={{ flex: 1, maxWidth: '600px', margin: '0 40px' }}>
        <TextField
          fullWidth
          placeholder="Search books, members..."
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton edge="end">
                  <SearchIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
            },
          }}
        />
      </Box>

      {/* Right: Quick Add button */}
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => navigate('/add-book')}
        sx={{
          borderRadius: '8px',
          padding: '8px 20px',
          textTransform: 'none',
          fontWeight: '600',
        }}
      >
        Quick Add
      </Button>
    </Box>
  );
};

export default Navbar;

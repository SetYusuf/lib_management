import React, { useState } from 'react';
import { Box, Typography, FormGroup, FormControlLabel, Checkbox, Divider, useTheme, Button } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';

const FilterPanel = ({ onFilterChange }) => {
  const theme = useTheme();
  const [filters, setFilters] = useState({
    genre: {
      fiction: false,
      nonfiction: false,
      adventure: false,
      biography: false,
      science: false,
      history: false,
    },
    status: {
      available: false,
      loaned: false,
      reserved: false,
      lost: false,
      damaged: false,
    },
    publicationDate: {
      before2000: false,
      '2000-2010': false,
      '2011-2020': false,
      after2020: false,
    },
  });

  const handleFilterChange = (category, filterName) => {
    const newFilters = {
      ...filters,
      [category]: {
        ...filters[category],
        [filterName]: !filters[category][filterName],
      },
    };
    setFilters(newFilters);
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      genre: {
        fiction: false,
        nonfiction: false,
        adventure: false,
        biography: false,
        science: false,
        history: false,
      },
      status: {
        available: false,
        loaned: false,
        reserved: false,
        lost: false,
        damaged: false,
      },
      publicationDate: {
        before2000: false,
        '2000-2010': false,
        '2011-2020': false,
        after2020: false,
      },
    };
    setFilters(clearedFilters);
    if (onFilterChange) {
      onFilterChange(clearedFilters);
    }
  };

  const hasActiveFilters = () => {
    return (
      Object.values(filters.genre).some(v => v) ||
      Object.values(filters.status).some(v => v) ||
      Object.values(filters.publicationDate).some(v => v)
    );
  };

  return (
    <Box
      sx={{
        width: '280px',
        backgroundColor: theme.palette.background.paper,
        padding: '20px',
        borderRadius: '8px',
        boxShadow: theme.shadows[2],
        marginRight: '20px',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <Typography
          variant="h6"
          sx={{
            fontSize: '18px',
            fontWeight: '600',
            color: theme.palette.text.primary,
          }}
        >
          Filter Panel
        </Typography>
        {hasActiveFilters() && (
          <Button
            size="small"
            startIcon={<ClearIcon />}
            onClick={handleClearFilters}
            sx={{
              textTransform: 'none',
              fontSize: '12px',
              color: theme.palette.text.secondary,
            }}
          >
            Clear
          </Button>
        )}
      </Box>

      {/* Genre Section */}
      <Box sx={{ marginBottom: '24px' }}>
        <Typography
          variant="subtitle2"
          sx={{
            fontSize: '14px',
            fontWeight: '600',
            marginBottom: '12px',
            color: theme.palette.text.secondary,
          }}
        >
          Genre
        </Typography>
        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                checked={filters.genre.fiction}
                onChange={() => handleFilterChange('genre', 'fiction')}
                sx={{
                  color: theme.palette.success.main,
                  '&.Mui-checked': {
                    color: theme.palette.success.main,
                  },
                }}
              />
            }
            label="Fiction"
            sx={{ marginBottom: '8px' }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={filters.genre.nonfiction}
                onChange={() => handleFilterChange('genre', 'nonfiction')}
                sx={{
                  color: theme.palette.success.main,
                  '&.Mui-checked': {
                    color: theme.palette.success.main,
                  },
                }}
              />
            }
            label="Non-fiction"
            sx={{ marginBottom: '8px' }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={filters.genre.adventure}
                onChange={() => handleFilterChange('genre', 'adventure')}
                sx={{
                  color: theme.palette.success.main,
                  '&.Mui-checked': {
                    color: theme.palette.success.main,
                  },
                }}
              />
            }
            label="Adventure"
            sx={{ marginBottom: '8px' }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={filters.genre.biography}
                onChange={() => handleFilterChange('genre', 'biography')}
                sx={{
                  color: theme.palette.success.main,
                  '&.Mui-checked': {
                    color: theme.palette.success.main,
                  },
                }}
              />
            }
            label="Biography"
            sx={{ marginBottom: '8px' }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={filters.genre.science}
                onChange={() => handleFilterChange('genre', 'science')}
                sx={{
                  color: theme.palette.success.main,
                  '&.Mui-checked': {
                    color: theme.palette.success.main,
                  },
                }}
              />
            }
            label="Science"
            sx={{ marginBottom: '8px' }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={filters.genre.history}
                onChange={() => handleFilterChange('genre', 'history')}
                sx={{
                  color: theme.palette.success.main,
                  '&.Mui-checked': {
                    color: theme.palette.success.main,
                  },
                }}
              />
            }
            label="History"
          />
        </FormGroup>
      </Box>

      <Divider sx={{ marginBottom: '24px' }} />

      {/* Status Section */}
      <Box sx={{ marginBottom: '24px' }}>
        <Typography
          variant="subtitle2"
          sx={{
            fontSize: '14px',
            fontWeight: '600',
            marginBottom: '12px',
            color: theme.palette.text.secondary,
          }}
        >
          Status
        </Typography>
        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                checked={filters.status.available}
                onChange={() => handleFilterChange('status', 'available')}
                sx={{
                  color: theme.palette.success.main,
                  '&.Mui-checked': {
                    color: theme.palette.success.main,
                  },
                }}
              />
            }
            label="Available"
            sx={{ marginBottom: '8px' }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={filters.status.loaned}
                onChange={() => handleFilterChange('status', 'loaned')}
                sx={{
                  color: theme.palette.success.main,
                  '&.Mui-checked': {
                    color: theme.palette.success.main,
                  },
                }}
              />
            }
            label="Loaned"
            sx={{ marginBottom: '8px' }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={filters.status.reserved}
                onChange={() => handleFilterChange('status', 'reserved')}
                sx={{
                  color: theme.palette.success.main,
                  '&.Mui-checked': {
                    color: theme.palette.success.main,
                  },
                }}
              />
            }
            label="Reserved"
            sx={{ marginBottom: '8px' }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={filters.status.lost}
                onChange={() => handleFilterChange('status', 'lost')}
                sx={{
                  color: theme.palette.success.main,
                  '&.Mui-checked': {
                    color: theme.palette.success.main,
                  },
                }}
              />
            }
            label="Lost"
            sx={{ marginBottom: '8px' }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={filters.status.damaged}
                onChange={() => handleFilterChange('status', 'damaged')}
                sx={{
                  color: theme.palette.success.main,
                  '&.Mui-checked': {
                    color: theme.palette.success.main,
                  },
                }}
              />
            }
            label="Damaged"
          />
        </FormGroup>
      </Box>

      <Divider sx={{ marginBottom: '24px' }} />

      {/* Publication Date Section */}
      <Box>
        <Typography
          variant="subtitle2"
          sx={{
            fontSize: '14px',
            fontWeight: '600',
            marginBottom: '12px',
            color: theme.palette.text.secondary,
          }}
        >
          Publication Date
        </Typography>
        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                checked={filters.publicationDate.before2000}
                onChange={() => handleFilterChange('publicationDate', 'before2000')}
                sx={{
                  color: theme.palette.success.main,
                  '&.Mui-checked': {
                    color: theme.palette.success.main,
                  },
                }}
              />
            }
            label="Before 2000"
            sx={{ marginBottom: '8px' }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={filters.publicationDate['2000-2010']}
                onChange={() => handleFilterChange('publicationDate', '2000-2010')}
                sx={{
                  color: theme.palette.success.main,
                  '&.Mui-checked': {
                    color: theme.palette.success.main,
                  },
                }}
              />
            }
            label="2000-2010"
            sx={{ marginBottom: '8px' }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={filters.publicationDate['2011-2020']}
                onChange={() => handleFilterChange('publicationDate', '2011-2020')}
                sx={{
                  color: theme.palette.success.main,
                  '&.Mui-checked': {
                    color: theme.palette.success.main,
                  },
                }}
              />
            }
            label="2011-2020"
            sx={{ marginBottom: '8px' }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={filters.publicationDate.after2020}
                onChange={() => handleFilterChange('publicationDate', 'after2020')}
                sx={{
                  color: theme.palette.success.main,
                  '&.Mui-checked': {
                    color: theme.palette.success.main,
                  },
                }}
              />
            }
            label="After 2020"
          />
        </FormGroup>
      </Box>
    </Box>
  );
};

export default FilterPanel;


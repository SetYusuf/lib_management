import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Grid, CircularProgress, useTheme } from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PeopleIcon from '@mui/icons-material/People';
import BarChartIcon from '@mui/icons-material/BarChart';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const HomePage = () => {
  const theme = useTheme();
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalMembers: 0,
    activeLoans: 0,
    loading: true,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch all data in parallel
        const [booksResponse, membersResponse, loansResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/books`),
          axios.get(`${API_BASE_URL}/api/members`),
          axios.get(`${API_BASE_URL}/circulation`),
        ]);

        const books = booksResponse.data;
        const members = membersResponse.data;
        const loans = loansResponse.data?.circulation || [];

        // Calculate stats
        const totalBooks = books.length;
        const totalMembers = members.length;
        // Count active loans (status === 'Borrowed')
        const activeLoans = loans.filter((loan) => loan.status === 'Borrowed').length;
        
        setStats({
          totalBooks,
          totalMembers,
          activeLoans,
          loading: false,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
        setStats((prev) => ({ ...prev, loading: false }));
      }
    };

    fetchStats();
  }, []);
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
        <Typography
          variant="h4"
          sx={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: theme.palette.text.primary,
            marginBottom: '32px',
          }}
        >
          Dashboard
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
            <Card
              sx={{
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                '&:hover': {
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
                },
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '16px',
                  }}
                >
                  <MenuBookIcon
                    sx={{ fontSize: '40px', color: theme.palette.success.main }}
                  />
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: '600', color: theme.palette.text.primary }}
                    >
                      Total Books
                    </Typography>
                    <Typography variant="h4" sx={{ color: theme.palette.success.main }}>
                      {stats.loading ? <CircularProgress size={24} /> : stats.totalBooks}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card
              sx={{
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                '&:hover': {
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
                },
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '16px',
                  }}
                >
                  <PeopleIcon
                    sx={{ fontSize: '40px', color: theme.palette.primary.main }}
                  />
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: '600', color: theme.palette.text.primary }}
                    >
                      Total Members
                    </Typography>
                    <Typography variant="h4" sx={{ color: theme.palette.primary.main }}>
                      {stats.loading ? <CircularProgress size={24} /> : stats.totalMembers}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card
              sx={{
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                '&:hover': {
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
                },
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '16px',
                  }}
                >
                  <BarChartIcon
                    sx={{ fontSize: '40px', color: theme.palette.warning.main }}
                  />
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: '600', color: theme.palette.text.primary }}
                    >
                      Circulation
                    </Typography>
                    <Typography variant="h4" sx={{ color: theme.palette.warning.main }}>
                      {stats.loading ? <CircularProgress size={24} /> : stats.activeLoans}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default HomePage;

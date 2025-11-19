import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Box, useTheme } from '@mui/material';
import { SearchProvider } from './context/SearchContext';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import HomePage from './pages/HomePage';
import AddBookPage from './pages/AddBookPage';
import BookListPage from './pages/BookListPage';
import MembersPage from './pages/MembersPage';
import AddMemberPage from './pages/AddMemberPage';
import MemberDetailPage from './pages/MemberDetailPage';
import CirculationPage from './pages/CirculationPage';
import SettingsPage from './pages/SettingsPage';

const AppContent = () => {
  const theme = useTheme();
  
  return (
    <Router>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <Navbar />
        <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <Sidebar />
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              overflow: 'auto',
              backgroundColor: theme.palette.background.default,
            }}
          >
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/add-book" element={<AddBookPage />} />
                <Route path="/add-book/:id" element={<AddBookPage />} />
                <Route path="/view-books" element={<BookListPage />} />
                <Route path="/members" element={<MembersPage />} />
                <Route path="/members/:id" element={<MemberDetailPage />} />
                <Route path="/add-member" element={<AddMemberPage />} />
                <Route path="/add-member/:id" element={<AddMemberPage />} />
                <Route path="/circulation" element={<CirculationPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Routes>
            </Box>
          </Box>
        </Box>
      </Router>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <SearchProvider>
          <AppContent />
        </SearchProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;


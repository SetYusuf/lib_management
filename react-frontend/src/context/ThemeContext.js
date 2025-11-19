import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { createTheme, ThemeProvider as MUIThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import api from '../config/api';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState('light');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load theme from settings
    const loadTheme = async () => {
      try {
        const response = await api.get('/settings/system');
        const systemSettings = response.data.data || {};
        if (systemSettings.theme) {
          setMode(systemSettings.theme);
        }
      } catch (error) {
        console.error('Error loading theme:', error);
      } finally {
        setLoading(false);
      }
    };
    loadTheme();
  }, []);

  const changeTheme = async (newMode) => {
    try {
      // Get current system settings
      const response = await api.get('/settings/system');
      const currentSettings = response.data.data || {};
      
      // Update theme in settings
      await api.put('/settings/system', {
        data: {
          ...currentSettings,
          theme: newMode
        }
      });
      
      setMode(newMode);
    } catch (error) {
      console.error('Error changing theme:', error);
    }
  };

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: mode === 'dark' ? '#90caf9' : '#1565c0',
          },
          secondary: {
            main: mode === 'dark' ? '#f48fb1' : '#7b1fa2',
          },
          background: {
            default: mode === 'dark' ? '#121212' : '#f5f5f5',
            paper: mode === 'dark' ? '#1e1e1e' : '#ffffff',
          },
          text: {
            primary: mode === 'dark' ? '#ffffff' : '#000000',
            secondary: mode === 'dark' ? '#b0b0b0' : '#666666',
          },
        },
        components: {
          MuiDrawer: {
            styleOverrides: {
              paper: {
                backgroundColor: mode === 'dark' ? '#1e1e1e' : '#1565c0',
                color: '#ffffff',
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                backgroundColor: mode === 'dark' ? '#1e1e1e' : '#ffffff',
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundColor: mode === 'dark' ? '#1e1e1e' : '#ffffff',
              },
            },
          },
          MuiTableHead: {
            styleOverrides: {
              root: {
                backgroundColor: mode === 'dark' ? '#2d2d2d' : '#f5f5f5',
              },
            },
          },
        },
      }),
    [mode]
  );

  return (
    <ThemeContext.Provider value={{ mode, changeTheme, loading }}>
      <MUIThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MUIThemeProvider>
    </ThemeContext.Provider>
  );
};


import React from 'react';
import { List, ListItem, ListItemIcon, ListItemText, Drawer, Box, useTheme as useMUITheme } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { getTranslation } from '../translations';
import DashboardIcon from '@mui/icons-material/Dashboard';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PeopleIcon from '@mui/icons-material/People';
import BarChartIcon from '@mui/icons-material/BarChart';
import SettingsIcon from '@mui/icons-material/Settings';

const Sidebar = () => {
  const location = useLocation();
  const { language } = useLanguage();
  const theme = useMUITheme();
  const t = (path) => getTranslation(language, path);

  const menuItems = [
    { text: t('nav.dashboard'), icon: <DashboardIcon />, path: '/' },
    { text: t('nav.catalogue'), icon: <MenuBookIcon />, path: '/view-books' },
    { text: t('nav.members'), icon: <PeopleIcon />, path: '/members' },
    { text: t('nav.circulation'), icon: <BarChartIcon />, path: '/circulation' },
    { text: t('nav.settings'), icon: <SettingsIcon />, path: '/settings' },
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 240,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: 240,
          boxSizing: 'border-box',
          backgroundColor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#1565c0',
          color: '#ffffff',
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '20px 16px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <MenuBookIcon sx={{ fontSize: '28px' }} />
        <Box
          sx={{
            fontSize: '18px',
            fontWeight: 'bold',
            letterSpacing: '0.5px',
          }}
        >
          LIBRARY KSK
        </Box>
      </Box>
      <List sx={{ paddingTop: '8px' }}>
        {menuItems.map((item) => (
          <ListItem
            key={item.text}
            component={Link}
            to={item.path}
            sx={{
              margin: '4px 8px',
              borderRadius: '8px',
              backgroundColor: isActive(item.path) ? '#4caf50' : 'transparent',
              color: '#ffffff',
              '&:hover': {
                backgroundColor: isActive(item.path) ? '#45a049' : 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            <ListItemIcon sx={{ color: '#ffffff', minWidth: '40px' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.text}
              sx={{
                '& .MuiListItemText-primary': {
                  fontWeight: isActive(item.path) ? '600' : '400',
                },
              }}
            />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;

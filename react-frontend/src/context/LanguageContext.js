import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../config/api';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load language from settings
    const loadLanguage = async () => {
      try {
        const response = await api.get('/settings/system');
        const systemSettings = response.data.data || {};
        if (systemSettings.language) {
          setLanguage(systemSettings.language);
        }
      } catch (error) {
        console.error('Error loading language:', error);
      } finally {
        setLoading(false);
      }
    };
    loadLanguage();
  }, []);

  const changeLanguage = async (newLanguage) => {
    try {
      // Get current system settings
      const response = await api.get('/settings/system');
      const currentSettings = response.data.data || {};
      
      // Update language in settings
      await api.put('/settings/system', {
        data: {
          ...currentSettings,
          language: newLanguage
        }
      });
      
      setLanguage(newLanguage);
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, loading }}>
      {children}
    </LanguageContext.Provider>
  );
};


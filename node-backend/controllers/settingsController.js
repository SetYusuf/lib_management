const Settings = require('../models/Settings');

// Get all settings
exports.getAllSettings = async (req, res) => {
  try {
    const settings = await Settings.findAll({
      order: [['category', 'ASC']]
    });
    
    const settingsMap = {};
    settings.forEach(setting => {
      settingsMap[setting.category] = setting.data;
    });
    
    res.status(200).json({ settings: settingsMap });
  } catch (error) {
    console.error('Error getting settings:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
};

// Get settings by category
exports.getSettingsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const setting = await Settings.findOne({ where: { category } });
    
    if (!setting) {
      // Return default settings if not found
      return res.status(200).json({ 
        category,
        data: getDefaultSettings(category)
      });
    }
    
    res.status(200).json({ category: setting.category, data: setting.data });
  } catch (error) {
    console.error('Error getting settings:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
};

// Update settings by category
exports.updateSettings = async (req, res) => {
  try {
    const { category } = req.params;
    const { data } = req.body;
    
    if (!data) {
      return res.status(400).json({ message: 'Settings data is required' });
    }
    
    const [setting, created] = await Settings.upsert({
      category,
      data
    }, {
      returning: true
    });
    
    res.status(200).json({ 
      message: created ? 'Settings created successfully' : 'Settings updated successfully',
      category: setting.category,
      data: setting.data
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
};

// Reset settings to defaults
exports.resetSettings = async (req, res) => {
  try {
    const { category } = req.params;
    const defaultData = getDefaultSettings(category);
    
    const [setting, created] = await Settings.upsert({
      category,
      data: defaultData
    }, {
      returning: true
    });
    
    res.status(200).json({ 
      message: 'Settings reset to defaults',
      category: setting.category,
      data: setting.data
    });
  } catch (error) {
    console.error('Error resetting settings:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
};

// Helper function to get default settings
function getDefaultSettings(category) {
  const defaults = {
    library: {
      name: 'Library Management System',
      logo: '',
      address: '',
      phone: '',
      email: '',
      website: '',
      openingHours: {
        monday: { open: '09:00', close: '17:00', closed: false },
        tuesday: { open: '09:00', close: '17:00', closed: false },
        wednesday: { open: '09:00', close: '17:00', closed: false },
        thursday: { open: '09:00', close: '17:00', closed: false },
        friday: { open: '09:00', close: '17:00', closed: false },
        saturday: { open: '09:00', close: '13:00', closed: false },
        sunday: { open: '09:00', close: '13:00', closed: true }
      }
    },
    membership: {
      types: [
        { name: 'Student', maxBooks: 5, loanPeriod: 14, canRenew: true },
        { name: 'Staff', maxBooks: 10, loanPeriod: 30, canRenew: true },
        { name: 'Public', maxBooks: 3, loanPeriod: 14, canRenew: true }
      ],
      expirationRules: {
        student: { period: 365, unit: 'days' },
        staff: { period: 1095, unit: 'days' },
        public: { period: 365, unit: 'days' }
      },
      autoActivate: true
    },
    circulation: {
      defaultLoanPeriod: 14, // days
      maxRenewals: 2,
      renewalPeriod: 14, // days
      allowRenewalIfReserved: false,
      blockBorrowingIfOverdue: true,
      maxOverdueDaysBeforeBlock: 7
    },
    fines: {
      enabled: true,
      finePerDay: 0.50,
      maxFineAmount: 50.00,
      gracePeriod: 0, // days
      autoBlockIfFineExceeds: 10.00,
      lostBookFee: 25.00,
      damagedBookFee: 15.00
    },
    reservations: {
      maxReservationsPerUser: 5,
      autoCancelAfterDays: 7,
      notifyWhenAvailable: true,
      holdPeriod: 3 // days to pick up reserved book
    },
    books: {
      categories: ['Fiction', 'Non-Fiction', 'Reference', 'Textbook', 'Magazine', 'Journal'],
      genres: ['Science', 'History', 'Literature', 'Biography', 'Technology', 'Art', 'Music'],
      useDeweyDecimal: false,
      barcodeFormat: 'ISBN',
      accessionNumberPrefix: 'LIB',
      shelfLocations: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
    },
    notifications: {
      emailEnabled: true,
      smsEnabled: false,
      dueDateReminder: {
        enabled: true,
        daysBefore: 3
      },
      overdueReminder: {
        enabled: true,
        frequency: 'daily'
      },
      reservationReady: {
        enabled: true
      },
      emailTemplates: {
        dueDateReminder: 'Your book "{bookTitle}" is due on {dueDate}. Please return it on time.',
        overdue: 'Your book "{bookTitle}" is overdue. Please return it immediately to avoid fines.',
        reservationReady: 'Your reserved book "{bookTitle}" is now available for pickup.'
      }
    },
    system: {
      language: 'en',
      theme: 'light',
      passwordRules: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: false
      },
      enableAuditLogs: true,
      backupFrequency: 'daily'
    },
    permissions: {
      roles: {
        admin: {
          name: 'Administrator',
          permissions: ['all']
        },
        librarian: {
          name: 'Librarian',
          permissions: [
            'add_books',
            'edit_books',
            'delete_books',
            'manage_loans',
            'manage_reservations',
            'manage_fines',
            'view_reports',
            'manage_members'
          ]
        },
        assistant: {
          name: 'Assistant',
          permissions: [
            'add_books',
            'edit_books',
            'manage_loans',
            'manage_reservations',
            'view_reports'
          ]
        },
        member: {
          name: 'Member',
          permissions: [
            'view_books',
            'borrow_books',
            'reserve_books',
            'view_own_loans'
          ]
        }
      }
    }
  };
  
  return defaults[category] || {};
}


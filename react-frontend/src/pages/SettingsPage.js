import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  Tabs,
  Tab,
  Paper,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Snackbar,
  IconButton,
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme
} from '@mui/material';
import api from '../config/api';
import { useLanguage } from '../context/LanguageContext';
import { useTheme as useThemeContext } from '../context/ThemeContext';
import { getTranslation } from '../translations';
import SaveIcon from '@mui/icons-material/Save';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

const SettingsPage = () => {
  const { language, changeLanguage } = useLanguage();
  const { mode, changeTheme } = useThemeContext();
  const theme = useTheme();
  const t = (path) => getTranslation(language, path);
  const [tabValue, setTabValue] = useState(0);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/settings');
      setSettings(response.data.settings || {});
    } catch (error) {
      console.error('Error fetching settings:', error);
      showSnackbar('Error fetching settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const updateSettings = async (category, data) => {
    try {
      await api.put(`/settings/${category}`, { data });
      setSettings(prev => ({ ...prev, [category]: data }));
      
      // If language changed, update the context
      if (category === 'system' && data.language && data.language !== language) {
        await changeLanguage(data.language);
      }
      
      // If theme changed, update the context
      if (category === 'system' && data.theme && data.theme !== mode) {
        await changeTheme(data.theme);
      }
      
      showSnackbar(`${category} settings saved successfully`);
    } catch (error) {
      console.error('Error updating settings:', error);
      showSnackbar('Error saving settings', 'error');
    }
  };

  const resetSettings = async (category) => {
    try {
      await api.post(`/settings/${category}/reset`);
      await fetchSettings();
      showSnackbar(`${category} settings reset to defaults`);
    } catch (error) {
      console.error('Error resetting settings:', error);
      showSnackbar('Error resetting settings', 'error');
    }
  };

  const getSetting = (category, key, defaultValue = '') => {
    return settings[category]?.[key] ?? defaultValue;
  };

  const updateSetting = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const updateNestedSetting = (category, path, value) => {
    const keys = path.split('.');
    setSettings(prev => {
      const newSettings = { ...prev };
      const categoryData = { ...newSettings[category] };
      let current = categoryData;
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      newSettings[category] = categoryData;
      return newSettings;
    });
  };

  // Library Information Settings
  const LibrarySettings = () => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Library Information</Typography>
          <Box>
            <Button startIcon={<RefreshIcon />} onClick={() => resetSettings('library')} sx={{ mr: 1 }}>
              Reset
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={() => updateSettings('library', settings.library || {})}
            >
              Save
            </Button>
          </Box>
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Library Name"
              value={getSetting('library', 'name', '')}
              onChange={(e) => updateSetting('library', 'name', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Logo URL"
              value={getSetting('library', 'logo', '')}
              onChange={(e) => updateSetting('library', 'logo', e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Address"
              multiline
              rows={2}
              value={getSetting('library', 'address', '')}
              onChange={(e) => updateSetting('library', 'address', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Phone"
              value={getSetting('library', 'phone', '')}
              onChange={(e) => updateSetting('library', 'phone', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={getSetting('library', 'email', '')}
              onChange={(e) => updateSetting('library', 'email', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Website"
              value={getSetting('library', 'website', '')}
              onChange={(e) => updateSetting('library', 'website', e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>Opening Hours</Typography>
            {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
              <Box key={day} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Typography sx={{ minWidth: 100, textTransform: 'capitalize' }}>{day}</Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={!getSetting('library', `openingHours.${day}.closed`, false)}
                      onChange={(e) => updateNestedSetting('library', `openingHours.${day}.closed`, !e.target.checked)}
                    />
                  }
                  label="Open"
                />
                {!getSetting('library', `openingHours.${day}.closed`, false) && (
                  <>
                    <TextField
                      type="time"
                      label="Open"
                      value={getSetting('library', `openingHours.${day}.open`, '09:00')}
                      onChange={(e) => updateNestedSetting('library', `openingHours.${day}.open`, e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      sx={{ width: 120 }}
                    />
                    <TextField
                      type="time"
                      label="Close"
                      value={getSetting('library', `openingHours.${day}.close`, '17:00')}
                      onChange={(e) => updateNestedSetting('library', `openingHours.${day}.close`, e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      sx={{ width: 120 }}
                    />
                  </>
                )}
              </Box>
            ))}
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  // Membership Settings
  const MembershipSettings = () => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Membership Settings</Typography>
          <Box>
            <Button startIcon={<AddIcon />} onClick={() => { setDialogType('membership'); setOpenDialog(true); }} sx={{ mr: 1 }}>
              Add Type
            </Button>
            <Button startIcon={<RefreshIcon />} onClick={() => resetSettings('membership')} sx={{ mr: 1 }}>
              Reset
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={() => updateSettings('membership', settings.membership || {})}
            >
              Save
            </Button>
          </Box>
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Membership Types</Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Max Books</TableCell>
                    <TableCell>Loan Period (days)</TableCell>
                    <TableCell>Can Renew</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(settings.membership?.types || []).map((type, index) => (
                    <TableRow key={index}>
                      <TableCell>{type.name}</TableCell>
                      <TableCell>{type.maxBooks}</TableCell>
                      <TableCell>{type.loanPeriod}</TableCell>
                      <TableCell>
                        <Chip label={type.canRenew ? 'Yes' : 'No'} color={type.canRenew ? 'success' : 'default'} size="small" />
                      </TableCell>
                      <TableCell>
                        <IconButton size="small" color="error">
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={getSetting('membership', 'autoActivate', true)}
                  onChange={(e) => updateSetting('membership', 'autoActivate', e.target.checked)}
                />
              }
              label="Auto-activate new members"
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  // Circulation Settings
  const CirculationSettings = () => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Circulation Settings</Typography>
          <Box>
            <Button startIcon={<RefreshIcon />} onClick={() => resetSettings('circulation')} sx={{ mr: 1 }}>
              Reset
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={() => updateSettings('circulation', settings.circulation || {})}
            >
              Save
            </Button>
          </Box>
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="Default Loan Period (days)"
              value={getSetting('circulation', 'defaultLoanPeriod', 14)}
              onChange={(e) => updateSetting('circulation', 'defaultLoanPeriod', parseInt(e.target.value))}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="Maximum Renewals"
              value={getSetting('circulation', 'maxRenewals', 2)}
              onChange={(e) => updateSetting('circulation', 'maxRenewals', parseInt(e.target.value))}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="Renewal Period (days)"
              value={getSetting('circulation', 'renewalPeriod', 14)}
              onChange={(e) => updateSetting('circulation', 'renewalPeriod', parseInt(e.target.value))}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={getSetting('circulation', 'allowRenewalIfReserved', false)}
                  onChange={(e) => updateSetting('circulation', 'allowRenewalIfReserved', e.target.checked)}
                />
              }
              label="Allow renewal if book is reserved"
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={getSetting('circulation', 'blockBorrowingIfOverdue', true)}
                  onChange={(e) => updateSetting('circulation', 'blockBorrowingIfOverdue', e.target.checked)}
                />
              }
              label="Block borrowing if member has overdue books"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="Max Overdue Days Before Block"
              value={getSetting('circulation', 'maxOverdueDaysBeforeBlock', 7)}
              onChange={(e) => updateSetting('circulation', 'maxOverdueDaysBeforeBlock', parseInt(e.target.value))}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  // Fine Settings
  const FineSettings = () => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Fine Settings</Typography>
          <Box>
            <Button startIcon={<RefreshIcon />} onClick={() => resetSettings('fines')} sx={{ mr: 1 }}>
              Reset
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={() => updateSettings('fines', settings.fines || {})}
            >
              Save
            </Button>
          </Box>
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={getSetting('fines', 'enabled', true)}
                  onChange={(e) => updateSetting('fines', 'enabled', e.target.checked)}
                />
              }
              label="Enable fines"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="Fine Per Day ($)"
              value={getSetting('fines', 'finePerDay', 0.50)}
              onChange={(e) => updateSetting('fines', 'finePerDay', parseFloat(e.target.value))}
              inputProps={{ step: 0.01 }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="Maximum Fine Amount ($)"
              value={getSetting('fines', 'maxFineAmount', 50.00)}
              onChange={(e) => updateSetting('fines', 'maxFineAmount', parseFloat(e.target.value))}
              inputProps={{ step: 0.01 }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="Grace Period (days)"
              value={getSetting('fines', 'gracePeriod', 0)}
              onChange={(e) => updateSetting('fines', 'gracePeriod', parseInt(e.target.value))}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="Auto-block if fine exceeds ($)"
              value={getSetting('fines', 'autoBlockIfFineExceeds', 10.00)}
              onChange={(e) => updateSetting('fines', 'autoBlockIfFineExceeds', parseFloat(e.target.value))}
              inputProps={{ step: 0.01 }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="Lost Book Fee ($)"
              value={getSetting('fines', 'lostBookFee', 25.00)}
              onChange={(e) => updateSetting('fines', 'lostBookFee', parseFloat(e.target.value))}
              inputProps={{ step: 0.01 }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="Damaged Book Fee ($)"
              value={getSetting('fines', 'damagedBookFee', 15.00)}
              onChange={(e) => updateSetting('fines', 'damagedBookFee', parseFloat(e.target.value))}
              inputProps={{ step: 0.01 }}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  // Reservation Settings
  const ReservationSettings = () => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Reservation Settings</Typography>
          <Box>
            <Button startIcon={<RefreshIcon />} onClick={() => resetSettings('reservations')} sx={{ mr: 1 }}>
              Reset
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={() => updateSettings('reservations', settings.reservations || {})}
            >
              Save
            </Button>
          </Box>
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="Max Reservations Per User"
              value={getSetting('reservations', 'maxReservationsPerUser', 5)}
              onChange={(e) => updateSetting('reservations', 'maxReservationsPerUser', parseInt(e.target.value))}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="Auto-cancel After (days)"
              value={getSetting('reservations', 'autoCancelAfterDays', 7)}
              onChange={(e) => updateSetting('reservations', 'autoCancelAfterDays', parseInt(e.target.value))}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="Hold Period (days)"
              value={getSetting('reservations', 'holdPeriod', 3)}
              onChange={(e) => updateSetting('reservations', 'holdPeriod', parseInt(e.target.value))}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={getSetting('reservations', 'notifyWhenAvailable', true)}
                  onChange={(e) => updateSetting('reservations', 'notifyWhenAvailable', e.target.checked)}
                />
              }
              label="Notify user when reserved book becomes available"
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  // Book Settings
  const BookSettings = () => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Book Settings</Typography>
          <Box>
            <Button startIcon={<RefreshIcon />} onClick={() => resetSettings('books')} sx={{ mr: 1 }}>
              Reset
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={() => updateSettings('books', settings.books || {})}
            >
              Save
            </Button>
          </Box>
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Barcode Format</InputLabel>
              <Select
                value={getSetting('books', 'barcodeFormat', 'ISBN')}
                label="Barcode Format"
                onChange={(e) => updateSetting('books', 'barcodeFormat', e.target.value)}
              >
                <MenuItem value="ISBN">ISBN</MenuItem>
                <MenuItem value="Custom">Custom</MenuItem>
                <MenuItem value="Accession">Accession Number</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Accession Number Prefix"
              value={getSetting('books', 'accessionNumberPrefix', 'LIB')}
              onChange={(e) => updateSetting('books', 'accessionNumberPrefix', e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={getSetting('books', 'useDeweyDecimal', false)}
                  onChange={(e) => updateSetting('books', 'useDeweyDecimal', e.target.checked)}
                />
              }
              label="Use Dewey Decimal Classification"
            />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Categories</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {(settings.books?.categories || []).map((cat, index) => (
                <Chip key={index} label={cat} onDelete={() => {}} />
              ))}
              <Chip label="+ Add" onClick={() => {}} color="primary" />
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Genres</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {(settings.books?.genres || []).map((genre, index) => (
                <Chip key={index} label={genre} onDelete={() => {}} />
              ))}
              <Chip label="+ Add" onClick={() => {}} color="primary" />
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  // Notification Settings
  // const NotificationSettings = () => (
  //   <Card>
  //     <CardContent>
  //       <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
  //         <Typography variant="h6">Notification Settings</Typography>
  //         <Box>
  //           <Button startIcon={<RefreshIcon />} onClick={() => resetSettings('notifications')} sx={{ mr: 1 }}>
  //             Reset
  //           </Button>
  //           <Button
  //             variant="contained"
  //             startIcon={<SaveIcon />}
  //             onClick={() => updateSettings('notifications', settings.notifications || {})}
  //           >
  //             Save
  //           </Button>
  //         </Box>
  //       </Box>
  //       <Grid container spacing={2}>
  //         <Grid item xs={12}>
  //           <FormControlLabel
  //             control={
  //               <Switch
  //                 checked={getSetting('notifications', 'emailEnabled', true)}
  //                 onChange={(e) => updateSetting('notifications', 'emailEnabled', e.target.checked)}
  //               />
  //             }
  //             label="Enable Email Notifications"
  //           />
  //         </Grid>
  //         <Grid item xs={12}>
  //           <FormControlLabel
  //             control={
  //               <Switch
  //                 checked={getSetting('notifications', 'smsEnabled', false)}
  //                 onChange={(e) => updateSetting('notifications', 'smsEnabled', e.target.checked)}
  //               />
  //             }
  //             label="Enable SMS Notifications"
  //           />
  //         </Grid>
  //         <Grid item xs={12}>
  //           <Divider sx={{ my: 2 }} />
  //           <Typography variant="subtitle1" sx={{ mb: 1 }}>Due Date Reminder</Typography>
  //           <FormControlLabel
  //             control={
  //               <Switch
  //                 checked={getSetting('notifications', 'dueDateReminder.enabled', true)}
  //                 onChange={(e) => updateNestedSetting('notifications', 'dueDateReminder.enabled', e.target.checked)}
  //               />
  //             }
  //             label="Enabled"
  //           />
  //           <TextField
  //             fullWidth
  //             type="number"
  //             label="Days Before Due Date"
  //             value={getSetting('notifications', 'dueDateReminder.daysBefore', 3)}
  //             onChange={(e) => updateNestedSetting('notifications', 'dueDateReminder.daysBefore', parseInt(e.target.value))}
  //             sx={{ mt: 1 }}
  //           />
  //         </Grid>
  //         <Grid item xs={12}>
  //           <Divider sx={{ my: 2 }} />
  //           <Typography variant="subtitle1" sx={{ mb: 1 }}>Overdue Reminder</Typography>
  //           <FormControlLabel
  //             control={
  //               <Switch
  //                 checked={getSetting('notifications', 'overdueReminder.enabled', true)}
  //                 onChange={(e) => updateNestedSetting('notifications', 'overdueReminder.enabled', e.target.checked)}
  //               />
  //             }
  //             label="Enabled"
  //           />
  //           <FormControl fullWidth sx={{ mt: 1 }}>
  //             <InputLabel>Frequency</InputLabel>
  //             <Select
  //               value={getSetting('notifications', 'overdueReminder.frequency', 'daily')}
  //               label="Frequency"
  //               onChange={(e) => updateNestedSetting('notifications', 'overdueReminder.frequency', e.target.value)}
  //             >
  //               <MenuItem value="daily">Daily</MenuItem>
  //               <MenuItem value="weekly">Weekly</MenuItem>
  //               <MenuItem value="monthly">Monthly</MenuItem>
  //             </Select>
  //           </FormControl>
  //         </Grid>
  //       </Grid>
  //     </CardContent>
  //   </Card>
  // );

  // System Settings
  const SystemSettings = () => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">{t('settings.system')}</Typography>
          <Box>
            <Button startIcon={<RefreshIcon />} onClick={() => resetSettings('system')} sx={{ mr: 1 }}>
              {t('common.reset')}
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={() => updateSettings('system', settings.system || {})}
            >
              {t('common.save')}
            </Button>
          </Box>
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>{t('settings.language')}</InputLabel>
              <Select
                value={getSetting('system', 'language', 'en')}
                label={t('settings.language')}
                onChange={async (e) => {
                  const newLang = e.target.value;
                  updateSetting('system', 'language', newLang);
                  // Immediately change language in context
                  await changeLanguage(newLang);
                  // Save to settings
                  const currentSystemSettings = settings.system || {};
                  await updateSettings('system', { ...currentSystemSettings, language: newLang });
                }}
              >
                <MenuItem value="en">English</MenuItem>
                <MenuItem value="kh">ខ្មែរ (Khmer)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>{t('settings.theme')}</InputLabel>
              <Select
                value={getSetting('system', 'theme', mode)}
                label={t('settings.theme')}
                onChange={async (e) => {
                  const newTheme = e.target.value;
                  updateSetting('system', 'theme', newTheme);
                  // Immediately change theme in context
                  await changeTheme(newTheme);
                  // Save to settings
                  const currentSystemSettings = settings.system || {};
                  await updateSettings('system', { ...currentSystemSettings, theme: newTheme });
                }}
              >
                <MenuItem value="light">{t('settings.light')}</MenuItem>
                <MenuItem value="dark">{t('settings.dark')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" sx={{ mb: 1 }}>{t('settings.passwordRules')}</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label={t('settings.minLength')}
                  value={getSetting('system', 'passwordRules.minLength', 8)}
                  onChange={(e) => updateNestedSetting('system', 'passwordRules.minLength', parseInt(e.target.value))}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>{t('settings.backupFrequency')}</InputLabel>
                  <Select
                    value={getSetting('system', 'backupFrequency', 'daily')}
                    label={t('settings.backupFrequency')}
                    onChange={(e) => updateSetting('system', 'backupFrequency', e.target.value)}
                  >
                    <MenuItem value="daily">{t('settings.daily')}</MenuItem>
                    <MenuItem value="weekly">{t('settings.weekly')}</MenuItem>
                    <MenuItem value="monthly">{t('settings.monthly')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={getSetting('system', 'passwordRules.requireUppercase', true)}
                      onChange={(e) => updateNestedSetting('system', 'passwordRules.requireUppercase', e.target.checked)}
                    />
                  }
                  label={t('settings.requireUppercase')}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={getSetting('system', 'passwordRules.requireLowercase', true)}
                      onChange={(e) => updateNestedSetting('system', 'passwordRules.requireLowercase', e.target.checked)}
                    />
                  }
                  label={t('settings.requireLowercase')}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={getSetting('system', 'passwordRules.requireNumbers', true)}
                      onChange={(e) => updateNestedSetting('system', 'passwordRules.requireNumbers', e.target.checked)}
                    />
                  }
                  label={t('settings.requireNumbers')}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={getSetting('system', 'passwordRules.requireSpecialChars', false)}
                      onChange={(e) => updateNestedSetting('system', 'passwordRules.requireSpecialChars', e.target.checked)}
                    />
                  }
                  label={t('settings.requireSpecialChars')}
                />
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={getSetting('system', 'enableAuditLogs', true)}
                  onChange={(e) => updateSetting('system', 'enableAuditLogs', e.target.checked)}
                />
              }
              label={t('settings.enableAuditLogs')}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  const tabSections = [
    { label: t('settings.libraryInfo'), component: <LibrarySettings /> },
    // { label: t('settings.membership'), component: <MembershipSettings /> },
    // { label: t('settings.circulation'), component: <CirculationSettings /> },
    // { label: t('settings.fines'), component: <FineSettings /> },
    // { label: t('settings.reservations'), component: <ReservationSettings /> },
    // { label: t('settings.books'), component: <BookSettings /> },
    // { label: t('settings.notifications'), component: <NotificationSettings /> },
    { label: t('settings.system'), component: <SystemSettings /> },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 'bold', color: theme.palette.primary.main, mb: 3 }}>
        {t('settings.title')}
      </Typography>

      <Paper sx={{ mb: 2 }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          {tabSections.map((section, index) => (
            <Tab key={index} label={section.label} />
          ))}
        </Tabs>
      </Paper>

      {tabSections[tabValue]?.component}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SettingsPage;


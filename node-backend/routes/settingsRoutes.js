const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');

router.get('/settings', settingsController.getAllSettings);
router.get('/settings/:category', settingsController.getSettingsByCategory);
router.put('/settings/:category', settingsController.updateSettings);
router.post('/settings/:category/reset', settingsController.resetSettings);

module.exports = router;


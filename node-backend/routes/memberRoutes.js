// routes/memberRoutes.js

const express = require('express');
const router = express.Router();
const memberController = require('../controllers/memberController');

router.post('/api/members', memberController.createMember);
router.get('/api/members', memberController.getAllMembers);
router.get('/api/members/:id', memberController.getMemberById);
router.put('/api/members/:id', memberController.updateMember);
router.delete('/api/members/:id', memberController.deleteMember);

module.exports = router;

const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loanController');

router.post('/api/loans', loanController.createLoan);
router.get('/api/members/:memberId/loans', loanController.getLoansByMember);
router.put('/api/loans/:id/return', loanController.returnLoan);
router.delete('/api/loans/:id', loanController.deleteLoan);

module.exports = router;

const express = require('express');
const router = express.Router();
const circulationController = require('../controllers/circulationController');

// Borrowing and Returning
router.post('/circulation/borrow', circulationController.borrowBook);
router.put('/circulation/return/:loanId', circulationController.returnBook);
router.put('/circulation/renew/:loanId', circulationController.renewLoan);

// Reservations
router.post('/circulation/reservations', circulationController.createReservation);
router.delete('/circulation/reservations/:reservationId', circulationController.cancelReservation);
router.get('/circulation/reservations', circulationController.getReservations);

// Fines
router.put('/circulation/fines/:fineId/pay', circulationController.payFine);
router.put('/circulation/fines/:fineId/waive', circulationController.waiveFine);
router.get('/circulation/fines/member/:memberId', circulationController.getMemberFines);

// Circulation Queries
router.get('/circulation/member/:memberId', circulationController.getMemberCirculation);
router.get('/circulation/book/:bookId', circulationController.getBookCirculation);
router.get('/circulation', circulationController.getAllCirculation);
router.get('/circulation/overdue', circulationController.getOverdueBooks);

module.exports = router;

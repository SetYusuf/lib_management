// routes/bookRoutes.js

const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');

router.post('/api/books', bookController.createBook);
router.get('/api/books', bookController.getAllBooks);
router.get('/api/books/:id', bookController.getBookById);
router.put('/api/books/:id', bookController.updateBook);
router.delete('/api/books/:id', bookController.deleteBook);

module.exports = router;

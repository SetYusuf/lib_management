const Loan = require('../models/Loan');
const Book = require('../models/Book');

exports.createLoan = async (req, res) => {
  try {
    const { memberId, bookId, loanDate, dueDate } = req.body;
    const loan = await Loan.create({ memberId, bookId, loanDate, dueDate });
    res.status(201).json({ message: 'Loan created', loan });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
};

exports.getLoansByMember = async (req, res) => {
  try {
    const memberId = Number(req.params.memberId);
    const loans = await Loan.findAll({ where: { memberId }, order: [['createdAt', 'DESC']] });
    const withBooks = await Promise.all(loans.map(async (l) => {
      const book = await Book.findByPk(l.bookId);
      return {
        ...l.toJSON(),
        book: book ? { id: book.id, title: book.title, isbn: book.isbn } : null,
      };
    }));
    res.status(200).json(withBooks);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.returnLoan = async (req, res) => {
  try {
    const loan = await Loan.findByPk(req.params.id);
    if (!loan) return res.status(404).json({ message: 'Loan not found' });
    await loan.update({ status: 'Returned', returnDate: new Date() });
    res.status(200).json({ message: 'Loan returned', loan });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.deleteLoan = async (req, res) => {
  try {
    const deleted = await Loan.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ message: 'Loan not found' });
    res.status(200).json({ message: 'Loan deleted' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

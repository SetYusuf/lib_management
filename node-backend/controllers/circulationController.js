const Loan = require('../models/Loan');
const Book = require('../models/Book');
const Member = require('../models/Member');
const Reservation = require('../models/Reservation');
const Fine = require('../models/Fine');
const { Op } = require('sequelize');

// Constants
const FINE_PER_DAY = 0.50; // $0.50 per day overdue
const DEFAULT_LOAN_DAYS = 14;
const MAX_RENEWALS = 2;

// Helper function to calculate fine
const calculateFine = (dueDate) => {
  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = today - due;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays * FINE_PER_DAY : 0;
};

// Helper function to calculate days overdue
const calculateDaysOverdue = (dueDate) => {
  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = today - due;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// 1. Borrowing (Check-out)
exports.borrowBook = async (req, res) => {
  try {
    const { memberId, bookId, dueDate } = req.body;
    
    const member = await Member.findByPk(memberId);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }
    
    // Check if member is active
    if (member.status !== 'Active') {
      return res.status(400).json({ message: 'Member account is suspended' });
    }
    
    // Check if member has unpaid fines (block borrowing if fine balance > 0)
    if (member.fineBalance > 0) {
      return res.status(400).json({ 
        message: `Member has unpaid fines of $${member.fineBalance.toFixed(2)}. Please pay fines before borrowing.` 
      });
    }
    
    // Check borrowing limit
    const activeLoans = await Loan.count({
      where: { memberId, status: 'Borrowed' }
    });
    
    if (activeLoans >= member.maxBooksLimit) {
      return res.status(400).json({ 
        message: `Member has reached the maximum borrowing limit of ${member.maxBooksLimit} books` 
      });
    }
    
    const book = await Book.findByPk(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    // Check book availability
    if (book.status === 'Lost' || book.status === 'Damaged') {
      return res.status(400).json({ message: `Book is ${book.status.toLowerCase()} and cannot be borrowed` });
    }
    
    if (book.quantity <= 0) {
      return res.status(400).json({ message: 'Book is not available for borrowing' });
    }
    
    // Check if member already has this book
    const existingLoan = await Loan.findOne({
      where: { memberId, bookId, status: 'Borrowed' }
    });
    
    if (existingLoan) {
      return res.status(400).json({ message: 'Member has already borrowed this book' });
    }
    
    // Check if there's a reservation for this book by another member
    const reservation = await Reservation.findOne({
      where: { 
        bookId, 
        status: 'Pending',
        memberId: { [Op.ne]: memberId } // Not this member
      }
    });
    
    const loanDate = new Date().toISOString().split('T')[0];
    const finalDueDate = dueDate || new Date(Date.now() + DEFAULT_LOAN_DAYS * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    // Create loan
    const loan = await Loan.create({
      memberId,
      bookId,
      loanDate,
      dueDate: finalDueDate,
      renewalCount: 0,
      fineAmount: 0.00
    });
    
    // Update book quantity and status
    const newQuantity = book.quantity - 1;
    let newStatus = 'Available';
    if (newQuantity === 0) {
      newStatus = reservation ? 'Reserved' : 'Loaned';
    }
    
    await Book.update(
      { quantity: newQuantity, status: newStatus },
      { where: { id: bookId } }
    );
    
    // Check if this member had a reservation for this book and mark it as fulfilled
    const memberReservation = await Reservation.findOne({
      where: { memberId, bookId, status: 'Pending' }
    });
    
    if (memberReservation) {
      await memberReservation.update({ status: 'Fulfilled' });
    }
    
    res.status(201).json({ 
      message: 'Book borrowed successfully', 
      loan: {
        ...loan.toJSON(),
        receipt: {
          loanId: loan.id,
          memberName: member.name,
          bookTitle: book.title,
          loanDate: loanDate,
          dueDate: finalDueDate
        }
      }
    });
  } catch (error) {
    console.error('Error borrowing book:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
};

// 2. Returning (Check-in) with fine calculation
exports.returnBook = async (req, res) => {
  try {
    const { loanId } = req.params;
    
    const loan = await Loan.findByPk(loanId);
    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }
    
    if (loan.status === 'Returned') {
      return res.status(400).json({ message: 'Book has already been returned' });
    }
    
    const book = await Book.findByPk(loan.bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    const member = await Member.findByPk(loan.memberId);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }
    
    const returnDate = new Date().toISOString().split('T')[0];
    
    // Calculate fine if overdue
    let fineAmount = 0;
    let daysOverdue = 0;
    const today = new Date();
    const due = new Date(loan.dueDate);
    
    if (today > due) {
      daysOverdue = calculateDaysOverdue(loan.dueDate);
      fineAmount = calculateFine(loan.dueDate);
      
      // Create fine record
      await Fine.create({
        memberId: loan.memberId,
        loanId: loan.id,
        amount: fineAmount,
        reason: 'Overdue',
        status: 'Pending',
        daysOverdue: daysOverdue
      });
      
      // Update member's fine balance
      await Member.update(
        { fineBalance: parseFloat(member.fineBalance) + fineAmount },
        { where: { id: loan.memberId } }
      );
    }
    
    // Update loan
    await loan.update({
      status: 'Returned',
      returnDate: returnDate,
      fineAmount: fineAmount
    });
    
    // Update book quantity and status
    const newQuantity = book.quantity + 1;
    
    // Check if there are pending reservations
    const pendingReservation = await Reservation.findOne({
      where: { bookId: book.id, status: 'Pending' },
      order: [['reservationDate', 'ASC']]
    });
    
    let newStatus = 'Available';
    if (pendingReservation) {
      newStatus = 'Reserved';
    } else if (newQuantity > 0) {
      newStatus = 'Available';
    } else {
      newStatus = book.status === 'Lost' || book.status === 'Damaged' ? book.status : 'Loaned';
    }
    
    await Book.update(
      { quantity: newQuantity, status: newStatus },
      { where: { id: loan.bookId } }
    );
    
    // Notify first person in reservation queue if book is now available
    if (pendingReservation && newQuantity > 0) {
      await pendingReservation.update({ 
        status: 'Available',
        notificationSent: true
      });
    }
    
    res.status(200).json({ 
      message: 'Book returned successfully', 
      loan: loan.toJSON(),
      fine: fineAmount > 0 ? {
        amount: fineAmount,
        daysOverdue: daysOverdue,
        message: `Fine of $${fineAmount.toFixed(2)} has been added to member's account`
      } : null
    });
  } catch (error) {
    console.error('Error returning book:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
};

// 3. Renewal with reservation check
exports.renewLoan = async (req, res) => {
  try {
    const { loanId } = req.params;
    const { newDueDate } = req.body;
    
    const loan = await Loan.findByPk(loanId);
    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }
    
    if (loan.status === 'Returned') {
      return res.status(400).json({ message: 'Cannot renew a returned loan' });
    }
    
    // Check renewal limit
    if (loan.renewalCount >= MAX_RENEWALS) {
      return res.status(400).json({ message: `Maximum renewal limit of ${MAX_RENEWALS} has been reached` });
    }
    
    // Check if book is reserved by someone else
    const reservation = await Reservation.findOne({
      where: { 
        bookId: loan.bookId, 
        status: 'Pending',
        memberId: { [Op.ne]: loan.memberId }
      }
    });
    
    if (reservation) {
      return res.status(400).json({ message: 'Cannot renew: Book is reserved by another member' });
    }
    
    const today = new Date().toISOString().split('T')[0];
    const finalDueDate = newDueDate || new Date(Date.now() + DEFAULT_LOAN_DAYS * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    if (finalDueDate <= today) {
      return res.status(400).json({ message: 'New due date must be in the future' });
    }
    
    // Calculate any existing fine up to now
    let existingFine = 0;
    if (new Date(loan.dueDate) < new Date(today)) {
      existingFine = calculateFine(loan.dueDate);
    }
    
    await loan.update({ 
      dueDate: finalDueDate,
      renewalCount: loan.renewalCount + 1,
      fineAmount: existingFine
    });
    
    res.status(200).json({ 
      message: 'Loan renewed successfully', 
      loan: loan.toJSON(),
      renewalCount: loan.renewalCount + 1
    });
  } catch (error) {
    console.error('Error renewing loan:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
};

// 4. Reservation / Hold
exports.createReservation = async (req, res) => {
  try {
    const { memberId, bookId } = req.body;
    
    const member = await Member.findByPk(memberId);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }
    
    if (member.status !== 'Active') {
      return res.status(400).json({ message: 'Member account is suspended' });
    }
    
    const book = await Book.findByPk(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    // Check if member already has this book borrowed
    const existingLoan = await Loan.findOne({
      where: { memberId, bookId, status: 'Borrowed' }
    });
    
    if (existingLoan) {
      return res.status(400).json({ message: 'Member already has this book borrowed' });
    }
    
    // Check if member already has a reservation for this book
    const existingReservation = await Reservation.findOne({
      where: { memberId, bookId, status: { [Op.in]: ['Pending', 'Available'] } }
    });
    
    if (existingReservation) {
      return res.status(400).json({ message: 'Member already has a reservation for this book' });
    }
    
    // If book is available, mark reservation as available immediately
    let status = 'Pending';
    if (book.quantity > 0 && book.status === 'Available') {
      status = 'Available';
    }
    
    const reservationDate = new Date().toISOString().split('T')[0];
    const expiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 7 days
    
    const reservation = await Reservation.create({
      memberId,
      bookId,
      reservationDate,
      status,
      expiryDate
    });
    
    // Update book status if it becomes reserved
    if (book.quantity === 0 && book.status !== 'Reserved') {
      await Book.update({ status: 'Reserved' }, { where: { id: bookId } });
    }
    
    res.status(201).json({ 
      message: status === 'Available' ? 'Book is available for pickup' : 'Reservation created successfully',
      reservation: reservation.toJSON()
    });
  } catch (error) {
    console.error('Error creating reservation:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
};

exports.cancelReservation = async (req, res) => {
  try {
    const { reservationId } = req.params;
    
    const reservation = await Reservation.findByPk(reservationId);
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }
    
    if (reservation.status === 'Cancelled' || reservation.status === 'Fulfilled') {
      return res.status(400).json({ message: 'Reservation cannot be cancelled' });
    }
    
    await reservation.update({ status: 'Cancelled' });
    
    // Check if book should be available now
    const book = await Book.findByPk(reservation.bookId);
    const activeReservations = await Reservation.count({
      where: { bookId: reservation.bookId, status: { [Op.in]: ['Pending', 'Available'] } }
    });
    
    if (book.quantity > 0 && activeReservations === 0) {
      await Book.update({ status: 'Available' }, { where: { id: reservation.bookId } });
    }
    
    res.status(200).json({ message: 'Reservation cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling reservation:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
};

exports.getReservations = async (req, res) => {
  try {
    const { memberId, bookId, status } = req.query;
    
    const whereClause = {};
    if (memberId) whereClause.memberId = memberId;
    if (bookId) whereClause.bookId = bookId;
    if (status) whereClause.status = status;
    
    const reservations = await Reservation.findAll({
      where: whereClause,
      order: [['reservationDate', 'ASC']]
    });
    
    const reservationDetails = await Promise.all(reservations.map(async (reservation) => {
      const [book, member] = await Promise.all([
        Book.findByPk(reservation.bookId),
        Member.findByPk(reservation.memberId)
      ]);
      
      return {
        ...reservation.toJSON(),
        book: book ? {
          id: book.id,
          title: book.title,
          author: book.author,
          isbn: book.isbn
        } : null,
        member: member ? {
          id: member.id,
          name: member.name,
          email: member.email
        } : null
      };
    }));
    
    res.status(200).json({ reservations: reservationDetails, total: reservationDetails.length });
  } catch (error) {
    console.error('Error getting reservations:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
};

// 5. Fine Management
exports.payFine = async (req, res) => {
  try {
    const { fineId } = req.params;
    const { amount } = req.body;
    
    const fine = await Fine.findByPk(fineId);
    if (!fine) {
      return res.status(404).json({ message: 'Fine not found' });
    }
    
    if (fine.status === 'Paid') {
      return res.status(400).json({ message: 'Fine has already been paid' });
    }
    
    const member = await Member.findByPk(fine.memberId);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }
    
    const paymentAmount = parseFloat(amount) || parseFloat(fine.amount);
    const newBalance = Math.max(0, parseFloat(member.fineBalance) - paymentAmount);
    
    await fine.update({
      status: 'Paid',
      paidDate: new Date().toISOString().split('T')[0]
    });
    
    await Member.update(
      { fineBalance: newBalance },
      { where: { id: fine.memberId } }
    );
    
    res.status(200).json({ 
      message: 'Fine paid successfully',
      fine: fine.toJSON(),
      remainingBalance: newBalance
    });
  } catch (error) {
    console.error('Error paying fine:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
};

exports.waiveFine = async (req, res) => {
  try {
    const { fineId } = req.params;
    
    const fine = await Fine.findByPk(fineId);
    if (!fine) {
      return res.status(404).json({ message: 'Fine not found' });
    }
    
    if (fine.status === 'Paid') {
      return res.status(400).json({ message: 'Cannot waive a paid fine' });
    }
    
    const member = await Member.findByPk(fine.memberId);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }
    
    const newBalance = Math.max(0, parseFloat(member.fineBalance) - parseFloat(fine.amount));
    
    await fine.update({ status: 'Waived' });
    
    await Member.update(
      { fineBalance: newBalance },
      { where: { id: fine.memberId } }
    );
    
    res.status(200).json({ 
      message: 'Fine waived successfully',
      fine: fine.toJSON(),
      remainingBalance: newBalance
    });
  } catch (error) {
    console.error('Error waiving fine:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
};

exports.getMemberFines = async (req, res) => {
  try {
    const { memberId } = req.params;
    
    const fines = await Fine.findAll({
      where: { memberId },
      order: [['createdAt', 'DESC']]
    });
    
    const member = await Member.findByPk(memberId);
    
    res.status(200).json({
      fines: fines.map(f => f.toJSON()),
      totalFines: fines.length,
      totalAmount: fines.reduce((sum, f) => sum + parseFloat(f.amount), 0),
      unpaidAmount: fines
        .filter(f => f.status === 'Pending')
        .reduce((sum, f) => sum + parseFloat(f.amount), 0),
      memberBalance: member ? parseFloat(member.fineBalance) : 0
    });
  } catch (error) {
    console.error('Error getting member fines:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
};

// Existing functions (updated)
exports.getMemberCirculation = async (req, res) => {
  try {
    const { memberId } = req.params;
    
    const member = await Member.findByPk(memberId);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }
    
    const loans = await Loan.findAll({
      where: { memberId },
      order: [['createdAt', 'DESC']]
    });
    
    const reservations = await Reservation.findAll({
      where: { memberId, status: { [Op.in]: ['Pending', 'Available'] } },
      order: [['reservationDate', 'ASC']]
    });
    
    const circulationDetails = await Promise.all(loans.map(async (loan) => {
      const book = await Book.findByPk(loan.bookId);
      const isOverdue = loan.status === 'Borrowed' && new Date(loan.dueDate) < new Date();
      const daysOverdue = isOverdue ? calculateDaysOverdue(loan.dueDate) : 0;
      
      return {
        ...loan.toJSON(),
        book: book ? {
          id: book.id,
          title: book.title,
          author: book.author,
          isbn: book.isbn
        } : null,
        isOverdue,
        daysOverdue
      };
    }));
    
    const reservationDetails = await Promise.all(reservations.map(async (reservation) => {
      const book = await Book.findByPk(reservation.bookId);
      return {
        ...reservation.toJSON(),
        book: book ? {
          id: book.id,
          title: book.title,
          author: book.author,
          isbn: book.isbn
        } : null
      };
    }));
    
    const activeLoans = circulationDetails.filter(loan => loan.status === 'Borrowed');
    const returnedLoans = circulationDetails.filter(loan => loan.status === 'Returned');
    
    res.status(200).json({
      member: {
        id: member.id,
        name: member.name,
        email: member.email,
        fineBalance: parseFloat(member.fineBalance),
        maxBooksLimit: member.maxBooksLimit,
        activeLoansCount: activeLoans.length
      },
      activeLoans,
      returnedLoans,
      reservations: reservationDetails,
      totalLoans: circulationDetails.length,
      activeLoansCount: activeLoans.length
    });
  } catch (error) {
    console.error('Error getting member circulation:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
};

exports.getBookCirculation = async (req, res) => {
  try {
    const { bookId } = req.params;
    
    const book = await Book.findByPk(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    const loans = await Loan.findAll({
      where: { bookId },
      order: [['createdAt', 'DESC']]
    });
    
    const reservations = await Reservation.findAll({
      where: { bookId, status: { [Op.in]: ['Pending', 'Available'] } },
      order: [['reservationDate', 'ASC']]
    });
    
    const circulationDetails = await Promise.all(loans.map(async (loan) => {
      const member = await Member.findByPk(loan.memberId);
      return {
        ...loan.toJSON(),
        member: member ? {
          id: member.id,
          name: member.name,
          email: member.email
        } : null
      };
    }));
    
    const reservationDetails = await Promise.all(reservations.map(async (reservation) => {
      const member = await Member.findByPk(reservation.memberId);
      return {
        ...reservation.toJSON(),
        member: member ? {
          id: member.id,
          name: member.name,
          email: member.email
        } : null
      };
    }));
    
    const activeLoans = circulationDetails.filter(loan => loan.status === 'Borrowed');
    const returnedLoans = circulationDetails.filter(loan => loan.status === 'Returned');
    
    res.status(200).json({
      book: {
        id: book.id,
        title: book.title,
        author: book.author,
        isbn: book.isbn,
        quantity: book.quantity,
        status: book.status
      },
      activeLoans,
      returnedLoans,
      reservations: reservationDetails,
      totalLoans: circulationDetails.length,
      timesBorrowed: returnedLoans.length
    });
  } catch (error) {
    console.error('Error getting book circulation:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
};

exports.getAllCirculation = async (req, res) => {
  try {
    const { status, memberId, bookId } = req.query;
    
    const whereClause = {};
    if (status) whereClause.status = status;
    if (memberId) whereClause.memberId = memberId;
    if (bookId) whereClause.bookId = bookId;
    
    const loans = await Loan.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']]
    });
    
    const circulationDetails = await Promise.all(loans.map(async (loan) => {
      const [book, member] = await Promise.all([
        Book.findByPk(loan.bookId),
        Member.findByPk(loan.memberId)
      ]);
      
      const isOverdue = loan.status === 'Borrowed' && new Date(loan.dueDate) < new Date();
      const daysOverdue = isOverdue ? calculateDaysOverdue(loan.dueDate) : 0;
      
      return {
        ...loan.toJSON(),
        book: book ? {
          id: book.id,
          title: book.title,
          author: book.author,
          isbn: book.isbn
        } : null,
        member: member ? {
          id: member.id,
          name: member.name,
          email: member.email
        } : null,
        isOverdue,
        daysOverdue
      };
    }));
    
    res.status(200).json({
      circulation: circulationDetails,
      total: circulationDetails.length,
      filters: { status, memberId, bookId }
    });
  } catch (error) {
    console.error('Error getting all circulation:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
};

exports.getOverdueBooks = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const overdueLoans = await Loan.findAll({
      where: {
        status: 'Borrowed',
        dueDate: {
          [Op.lt]: today
        }
      },
      order: [['dueDate', 'ASC']]
    });
    
    const overdueDetails = await Promise.all(overdueLoans.map(async (loan) => {
      const [book, member] = await Promise.all([
        Book.findByPk(loan.bookId),
        Member.findByPk(loan.memberId)
      ]);
      
      const daysOverdue = calculateDaysOverdue(loan.dueDate);
      const fineAmount = calculateFine(loan.dueDate);
      
      return {
        ...loan.toJSON(),
        book: book ? {
          id: book.id,
          title: book.title,
          author: book.author,
          isbn: book.isbn
        } : null,
        member: member ? {
          id: member.id,
          name: member.name,
          email: member.email
        } : null,
        daysOverdue,
        fineAmount
      };
    }));
    
    res.status(200).json({
      overdueBooks: overdueDetails,
      total: overdueDetails.length,
      date: today
    });
  } catch (error) {
    console.error('Error getting overdue books:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
};

// app.js

const express = require('express');
const cors = require('cors');
const { connectDB } = require('./database');
const bookRoutes = require('./routes/bookRoutes'); // Ensure the path is correct
const memberRoutes = require('./routes/memberRoutes');
const loanRoutes = require('./routes/loanRoutes');
const circulationRoutes = require('./routes/circulationRoutes');
const settingsRoutes = require('./routes/settingsRoutes');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Use book routes
app.use('/', bookRoutes);
// Use member routes
app.use('/', memberRoutes);
// Use loan routes
app.use('/', loanRoutes);
// Use circulation routes
app.use('/', circulationRoutes);
// Use settings routes
app.use('/', settingsRoutes);

app.listen(port, () => {
  console.log(`Backend server is running on http://localhost:${port}`);
  console.log(`API endpoints available at http://localhost:${port}/api/books`);
  console.log(`API endpoints available at http://localhost:${port}/api/members`);
  console.log(`API endpoints available at http://localhost:${port}/api/loans`);
  console.log(`API endpoints available at http://localhost:${port}/circulation`);
});

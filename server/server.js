const express = require('express');
const http = require('http');
const socket = require('./socket'); // Path to the socket.js file
require('dotenv').config();
const cors = require('cors');
const cookieSession = require('cookie-session');
const mongoose = require('mongoose');
const { isAuth, hasRole } = require('./utils');
const usersRouter = require('./routes/usersRouter')
const app = express();
const server = http.createServer(app);
const personalLoanRouter = require('./routes/personalLoanRouter')
const businessFinanceLoanRouter = require('./routes/businessFinanceLoanRouter')
const realEstateLoanRouter = require('./routes/realEstateLoanRouter')
const mortgageLoansRouter = require('./routes/mortgageLoanRouter')
const loansRouter = require('./routes/loansRouter')
const videoRouter = require('./routes/videoRouter')
const contactRouter = require('./routes/contactRouter')
const feedbackRouter = require('./routes/feedbackRouter')
const helpAndSupportRouter = require('./routes/helpAndSupportRouter')
const propertyRouter = require('./routes/propertyRouter')
const paypalRouter = require('./routes/paypalRouter')
const businessLeadRouter = require('./routes/businessLeadRouter')
const personalLeadRouter = require('./routes/personalLeadRouter')
const mortgageLeadRouter = require('./routes/mortgageLeadRouter')
const realEstateLeadRouter = require('./routes/realEstateLeadRouter')
const searchLeadRouter = require('./routes/searchLeadRouter')
const stripeRouter = require('./routes/stripe')
const uploadRouter = require('./routes/uploadRouter')
const path = require('path');
const permissionsRouter = require('./routes/permissions');
const rolesRouter = require('./routes/roles');
const rolePermissionsRouter = require('./routes/rolePermissions');
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(
  cors({
    origin: "*",
  })
);
// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
 
})
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Error connecting to MongoDB:', err));

app.use(
  cookieSession({
    name: 'session',
    keys: ['cyberwolve'],
    maxAge: 24 * 60 * 60 * 100,
  })
);

// Initialize Socket.IO and pass the HTTP server
socket.initializeSocket(server);

// Add a basic route to verify API is working
app.get('/',(req, res) => {
  res.send('API is working within Docker mounted! Welcome to Mr.Naveed The frontend Web Developer... Continue Your Spirit....');
});

app.use('/api/users', usersRouter);
 app.use('/api/personal-loans', personalLoanRouter);
app.use('/api/businessfinance-loans', businessFinanceLoanRouter);
app.use('/api/realestate-loans', realEstateLoanRouter);
app.use('/api/mortgage-loans', mortgageLoansRouter);
app.use('/api/loans', loansRouter);
app.use('/api/videos', videoRouter);
app.use('/api/contacts', contactRouter);
app.use('/api/feedbacks', feedbackRouter);
app.use('/api/helpandsupport', helpAndSupportRouter);
app.use('/api/properties', propertyRouter);
app.use('/paypal', paypalRouter);
// app.use('/stripe', stripeRouter);
// app.use('/api', flightRouter);


app.use('/api/business-lead', businessLeadRouter);
app.use('/api/personal-lead', personalLeadRouter);
app.use('/api/mortgage-lead', mortgageLeadRouter);
app.use('/api/realestate-lead', realEstateLeadRouter);
app.use('/api/search', searchLeadRouter);

app.use('/api/permissions', permissionsRouter);
app.use('/api/roles', rolesRouter);
app.use('/api', rolePermissionsRouter);
app.use('/uploads', uploadRouter);



const port = process.env.PORT || 8080;
server.listen(port, () => console.log(`Listening on port ${port}...`));


//4028dfbeffmsh967ce280cc57bb2p1bdda1jsnf28bca1d5a60
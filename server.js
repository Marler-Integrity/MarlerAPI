const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const errorHandler = require('./middleware/error');
const dbConnection = require('./middleware/dbConnection');

// const connectDB = require('./config/db');

dotenv.config({ path: './config/config.env' });

//route files
const subs = require('./routes/Subs/subs');
const hotels = require('./routes/Hotels/hotels');
const users = require('./routes/Users/users');
const checklist = require('./routes/Checklist/checklist');
const employeeHoursRouter = require('./routes/EmployeeHours/employeeHours');
const getSAPRef = require('./middleware/EmployeeHours/getSAPRef');
const getJobsFromSP = require('./middleware/EmployeeHours/getJobsFromSP');


// connect to DB
// connectDB();

const app = express();

//Development logger
if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev')); 
}

//cors
app.use(cors({
    origin: true,
    credentials: true
}));

//body parser
app.use(express.json());

//db connection middleware
app.use(dbConnection);

//route mounting
app.use('/api/v1/subs', subs);
app.use('/api/v1/hotels', hotels);
app.use('/api/v1/users', users);
app.use('/api/v1/checklist', checklist);

// app.use('/api/v1/employeehours', getSAPRef, employeeHoursRouter);
app.use('/api/v1/employeehours', employeeHoursRouter);
// app.use('/api/v1/employeehours', getJobsFromSP, employeeHoursRouter);

//error handler
app.use(errorHandler);

//PORT
const PORT = process.env.PORT || 5000;

//start server
const server = app.listen(PORT, console.log(`Server Running on PORT ${PORT}`));

//unhandled promise rejections handler
process.on('unhandledRejection', (err, promise) => {
    console.log(`error: ${err.message}`);
    //close the server
    server.close(() => process.exit(1));
});
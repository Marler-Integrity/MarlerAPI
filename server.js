const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const errorHandler = require('./middleware/error');

const connectDB = require('./config/db');

dotenv.config({ path: './config/config.env' });

//route files
const subs = require('./routes/subs');

// connect to DB
connectDB();

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

//route mounting
app.use('/api/v1/subs', subs);

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
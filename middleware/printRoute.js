const printRoute = (req, res, next) => {
    console.log(`Route: ${req.originalUrl}`);
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    next();
}

module.exports = printRoute;
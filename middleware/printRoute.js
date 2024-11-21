const printRoute = (req, res, next) => {
    console.log(`THIS IS THE ROUTE - ${req.originalUrl}`)
    next();
}

module.exports = printRoute;
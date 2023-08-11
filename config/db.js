const mongoose = require('mongoose');

const connectDB = async () => {
    const conn = await mongoose.connect(process.env.COSMOSDB_URI, {
        // useCreateIndex: true,
        // useFindAndModify: false,
        useNewUrlParser: true,
        useUnifiedTopology: true
    });

    console.log(`COSMOS DB Connected ${conn.connection.host}`);
}

module.exports = connectDB;
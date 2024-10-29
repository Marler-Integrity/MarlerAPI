const mongoose = require('mongoose');
const sql = require('mssql');

let mongoConnection;
const getMongoConnection = () => {
    if(!mongoConnection){
        mongoConnection = mongoose.createConnection(process.env.COSMOSDB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            maxPoolSize: 10,
            socketTimeoutMS: 30000
        });
    }
    return mongoConnection;
}

let sqlPool;
const getMssqlConnection = async() => {
    if(!sqlPool){
        sqlPool = await sql.connect({
            user: process.env.MSSQL_USER,
            password: process.env.MSSQL_PWD,
            server: process.env.MSSQL_SERVER,
            database: process.env.MSSQL_DB,
            options: {
                encrypt: true,
                trustServerCertificate: true
            },
            pool: {
                max: 10,
                min: 0,
                idleTimeoutMillis: 30000
            }
        });
    }
    return sqlPool
}

module.exports = {getMongoConnection, getMssqlConnection};

// const connectDB = async () => {
//     const conn = await mongoose.connect(process.env.COSMOSDB_URI, {
//         // useCreateIndex: true,
//         // useFindAndModify: false,
//         useNewUrlParser: true,
//         useUnifiedTopology: true
//     });

//     console.log(`COSMOS DB Connected ${conn.connection.host}`);
// }
const mongoose = require('mongoose');
const {Sequelize} = require("sequelize")

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
        sqlPool = new Sequelize(process.env.MSSQL_DB, process.env.MSSQL_USER, process.env.MSSQL_PWD, {
            host: process.env.MSSQL_SERVER,
            port: 1433,
            pool: {
                max: 10,
                min: 0,
                idleTimeoutMillis: 30000
            },
            dialect: 'mssql',
            dialectOptions: {
                options: {
                    encrypt: true
                }
            },
            logging: true
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
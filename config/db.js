const mongoose = require('mongoose');
const sql = require('mssql');
const { Sequelize } = require('sequelize');

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
            dialect: 'mssql',
            dialectOptions: {
                options: {
                    encrypt: true
                }
            },
            timezone: 'Z',
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
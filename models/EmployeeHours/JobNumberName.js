const { DataTypes } = require('sequelize');

const createJobNumberNameModel = (dbInstance) => {
    const JobNumberName = dbInstance.define('JobNumberName', {
        JobID: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        JobNumber: {
            type: DataTypes.INTEGER,
            unique: true
        },
        JobName: {
            type: DataTypes.STRING
        },
        Active: {
            type: DataTypes.BOOLEAN
        }
    }, {
        tableName: 'JobNumberName',
        timestamps: false
    });
    return JobNumberName;
}

module.exports = createJobNumberNameModel;
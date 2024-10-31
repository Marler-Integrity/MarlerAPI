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
            type: DataTypes.INTEGER
        },
        JobName: {
            types: DataTypes.STRING
        }
    }, {
        timestamps: false
    });
    return JobNumberName;
}

module.exports = createJobNumberNameModel;
const {DataTypes} = require('sequelize');

const createWorkingDataModel = (dbInstance) => {
    const WorkingData = dbInstance.define('WorkingData', {
        WorkingDataID: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
       LastName: {
            type: DataTypes.STRING,
       },
       FirstName: {
            type: DataTypes.STRING,
       },
       JobName: {
            type: DataTypes.INTEGER,
       },
       NumHours: {
            type: DataTypes.TINYINT
       },
       EmployeeDescription: {
            type: DataTypes.STRING,
       },
       SAPCategory: {
            type: DataTypes.INTEGER,
       },
       Notes: {
            type: DataTypes.STRING,
       },
       Regular: {
            type: DataTypes.BOOLEAN,
       },
       OT: {
            type: DataTypes.BOOLEAN,
       },
       Sub: {
            type: DataTypes.BOOLEAN,
       },
       SRDID: {
            type: DataTypes.INTEGER,
       },
       PeopleID: {
            type: DataTypes.INTEGER,
       },
       EntryDate: {
            type: DataTypes.DATE,
       },
       FrontEndID: {
        type: DataTypes.STRING, 
       }

    }, {
        timestamps: false
    });

    return WorkingData;
}

module.exports = createWorkingDataModel;
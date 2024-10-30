const {DataTypes} = require('sequelize');

const createSubmittedRawDataModel = (dbInstance) => {
    const SubmittedRawData = dbInstance.define('SubmittedRawData', {
        SRDID: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        JobID: {
            type: DataTypes.INTEGER
        },
        OptionalJobNumberAndName: {
            type: DataTypes.STRING
        },
        OptionalDescription: {
            type: DataTypes.STRING
        },
        SubCategoryID: {
            type: DataTypes.INTEGER
        },
        Notes: {
            type: DataTypes.STRING
        },
        MasterID: {
            type: DataTypes.INTEGER
        }
    }, {
        timestamps: false
    });
    
    return SubmittedRawData;
}

module.exports = createSubmittedRawDataModel;
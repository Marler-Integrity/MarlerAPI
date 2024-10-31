const {DataTypes} = require('sequelize');

const createWorkingDataModel = (dbInstance) => {
    const WorkingData = dbInstance.define('WorkingData', {
        WorkingDataID: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        }
    }, {
        timestamps: false
    });

    return WorkingData;
}

module.exports = createWorkingDataModel;
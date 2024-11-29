const { DataTypes } = require('sequelize');

const createControlDataModel = (dbInstance) => {
    const ControlData = dbInstance.define('ControlData', {
        ControlDataID: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        SAPRefUpdatedAt: {
            type: DataTypes.DATE
        }
    }, {
        timestamps: false
    });
    return ControlData;
}

module.exports = createControlDataModel;
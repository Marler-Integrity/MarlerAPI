const {DataTypes} = require('sequelize');

const createArchivedDataModel = (dbInstance) => {
    const ArchivedData = dbInstance.define('ArchivedData', {
        ADID: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        }
    }, {
        timestamps: false
    });

    return ArchivedData;
}

module.exports = createArchivedDataModel;
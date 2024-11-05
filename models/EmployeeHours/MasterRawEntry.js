const {DataTypes} = require('sequelize');

const createMasterRawEntryModel = (dbInstance) => {
    const MasterRawEntry = dbInstance.define('MasterRawEntry', {
        MasterID: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        EntryDate: {
            type: DataTypes.DATE,
            allowNull: false
        },
        PeopleID: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        Locked: {
            type: DataTypes.BOOLEAN,
            default: false
        }
    }, {
        tableName: 'MasterRawEntry',
        timestamps: false
    });

    return MasterRawEntry;
}

module.exports = createMasterRawEntryModel;
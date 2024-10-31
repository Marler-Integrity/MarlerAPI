const { DataTypes } = require('sequelize');

const createPeopleModel = (dbInstance) => {
    const People = dbInstance.define('People', {
        PersonID: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        LastName: {
            type: DataTypes.STRING
        },
        FirstName: {
            type: DataTypes.STRING
        },
        RegSAPCode : {
            type: DataTypes.INTEGER
        },
        OTSAPCode: {
            type: DataTypes.INTEGER
        },
        SubSAPCode: {
            type: DataTypes.INTEGER
        },
        NSubSAPCode: {
            type: DataTypes.INTEGER
        },
        IsActive: {
            type: DataTypes.BOOLEAN
        }
    }, {
        timestamps: false
    });
    return People;
}

module.exports = createPeopleModel;
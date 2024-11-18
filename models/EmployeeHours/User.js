const { DataTypes } = require('sequelize');

const createUserModel = (dbInstance) => {
    const User = dbInstance.define('User', {
        UserID: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        Role: {
            type: DataTypes.STRING
        },
        FirstName: {
            type: DataTypes.STRING
        },
        LastName: {
            type: DataTypes.STRING
        },
        Email: {
            type: DataTypes.STRING
        },
        Password: {
            type: DataTypes.STRING
        },
        IsActive: {
            type: DataTypes.BOOLEAN
        },
        CreatedAt: {
            type: DataTypes.DATE
        },
        Token: {
            type: DataTypes.STRING
        },
        IsVerified: {
            type: DataTypes.BOOLEAN
        }
    } , {
        tableName: 'Users',
        timestamps: false
    });

    return User;
}

module.exports = createUserModel;
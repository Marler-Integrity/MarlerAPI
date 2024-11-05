const { DataTypes } = require('sequelize');

const createSAPCategoryModel = (dbInstance) => {
    const SAPCategory = dbInstance.define('SAPCategory', {
        CategoryID:  {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        CategoryName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        CategoryNumber: {
            type: DataTypes.STRING,
            allowNull: false
        },
        SubCategoryName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        SubCategoryNumber: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
        tableName: 'SAPCategory',
        timestamps: false
    });
    
    return SAPCategory;
}

module.exports = createSAPCategoryModel
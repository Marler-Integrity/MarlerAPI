const { DataTypes } = require('sequelize');

const createSAPCategoryModel = (dbInstance) => {
    const SAPCategory = dbInstance.define('SAPCategory', {
        SAPCategoryID:  {
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
        }
    }, {
        timestamps: false
    });
    
    return SAPCategory;
}

module.exports = createSAPCategoryModel
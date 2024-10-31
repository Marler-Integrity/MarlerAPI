const { DataTypes } = require('sequelize');

const createSAPSubCategory = (dbInstance) => {
    const SAPSubCategory = dbInstance.define('SAPSubCategory', {
        SubCategoryID: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        SubCategoryName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        SubCategoryNumber: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        CategroryID: {
            type: DataTypes.INTEGER
        }
    }, {
        timestamps: false
    });

    return SAPSubCategory;
}

module.exports = createSAPSubCategory;
const { DataTypes } = require("sequelize");

const createWorkingDataModel = (dbInstance) => {
  const WorkingData = dbInstance.define(
    "WorkingData",
    {
      WorkingDataID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      LastName: {
        type: DataTypes.STRING,
      },
      FirstName: {
        type: DataTypes.STRING,
      },
      JobName: {
        type: DataTypes.STRING,
      },
      NumHours: {
        type: DataTypes.FLOAT,
      },
      Description: {
        type: DataTypes.STRING,
      },
      SAPCategory: {
        type: DataTypes.INTEGER,
      },
      Notes: {
        type: DataTypes.STRING,
      },
      Regular: {
        type: DataTypes.FLOAT,
      },
      OT: {
        type: DataTypes.FLOAT,
      },
      SRDID: {
        type: DataTypes.INTEGER,
      },
      PeopleID: {
        type: DataTypes.INTEGER,
      },
      EntryDate: {
        type: DataTypes.DATE,
      },
      FrontEndID: {
        type: DataTypes.STRING,
      },
      IsCopy: {
        type: DataTypes.BOOLEAN,
      },
    },
    {
      timestamps: false,
    }
  );

  return WorkingData;
};

module.exports = createWorkingDataModel;

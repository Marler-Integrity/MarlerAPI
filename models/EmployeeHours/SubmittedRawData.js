const { DataTypes } = require("sequelize");

const createSubmittedRawDataModel = (dbInstance) => {
  const SubmittedRawData = dbInstance.define(
    "SubmittedRawData",
    {
      SRDID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      JobID: {
        //this is the Job ID for Billable items
        type: DataTypes.INTEGER,
      },
      JobName: {
        type: DataTypes.STRING,
      },
      Description: {
        type: DataTypes.STRING, //remove this later - replaced with SAP Category
      },
      NumHours: {
        type: DataTypes.FLOAT,
      },
      Notes: {
        type: DataTypes.STRING,
      },
      MasterID: {
        type: DataTypes.STRING,
      },
      EntryDate: {
        type: DataTypes.DATE,
      },
      PeopleID: {
        type: DataTypes.INTEGER,
      },
      Locked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      Submitted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      SubmittedAt: {
        type: DataTypes.DATE
      },
      Discarded: {
        type: DataTypes.BOOLEAN,
      },
      SAPCategory: {
        type: DataTypes.INTEGER,
      }
    },
    {
      timestamps: false,
    }
  );

  return SubmittedRawData;
};

module.exports = createSubmittedRawDataModel;

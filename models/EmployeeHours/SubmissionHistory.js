const {DataTypes} = require('sequelize');

const createSubmissionHistoryModel = (dbInstance) => {
    const SubmissionHistory = dbInstance.define('SubmissionHistory', {
        SHID: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        SubmittedAt: {
            type: DataTypes.DATE
        },
        SubmittedBy: {
            type: DataTypes.INTEGER
        }
    }, {
        timestamps: false,
        tableName: 'SubmissionHistory'
    });
}

module.exports = createSubmissionHistoryModel;
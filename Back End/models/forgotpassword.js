const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const ForgotPassword = sequelize.define('forgotpassword', {
    id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false
    },
    active: {
        type: Sequelize.BOOLEAN
    },
    expiresby: {
        type: Sequelize.DATE
    }
});

module.exports = ForgotPassword;

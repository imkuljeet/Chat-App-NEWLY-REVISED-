const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const UserGroup = sequelize.define('user_group', {
    userId: {
        type: Sequelize.INTEGER,
        references: {
            model: 'users', // Reference to User model
            key: 'id'
        }
    },
    groupId: {
        type: Sequelize.INTEGER,
        references: {
            model: 'groups', // Reference to Group model
            key: 'id'
        }
    }
});

module.exports = UserGroup;

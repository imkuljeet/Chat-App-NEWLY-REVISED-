let Sequelize = require('sequelize');
let sequelize = require('../util/database');

let Group = sequelize.define('group',{
    id : {
        type : Sequelize.INTEGER,
        primaryKey : true,
        allowNull : false,
        autoIncrement : true
    },
    groupName : {
        type : Sequelize.STRING,
        allowNull : false
    }
});

module.exports = Group;

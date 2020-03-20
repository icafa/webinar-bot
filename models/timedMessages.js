const Sequelize = require("sequelize");

function defineProject(sequelize, DataTypes) {
    const TimedMessage = sequelize.define('TimedMessage', {
        id: { type: Sequelize.STRING, primaryKey: true },
        sock: DataTypes.STRING,
        videoTime: DataTypes.INTEGER,
        message: DataTypes.STRING,
        condition: DataTypes.STRING
    });
    return TimedMessage;
}

exports.default = defineProject;
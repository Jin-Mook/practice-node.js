const Sequelize = require('sequelize')

module.exports = class Chat extends Sequelize.Model {
  static init(sequelize) {
    return super.init({
      room: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      user: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      chat: {
        type: Sequelize.TEXT,
      },
      gif: {
        type: Sequelize.TEXT,
      },
    }, {
      sequelize,
      timestamps: true,
      underscored: false,
      modelName: 'Chat',
      tableName: 'chats',
      paranoid: true,
      charset: 'utf8',
      collate: 'utf8_general_ci',
    })
  }

  static associate(db) {
    db.Chat.belongsTo(db.Room, {
      foreignKey: 'room', targetKey: 'id',
    })
  }
}
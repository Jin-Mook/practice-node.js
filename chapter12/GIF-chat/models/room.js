const Sequelize = require('sequelize')

module.exports = class Room extends Sequelize.Model {
  static init(sequelize) {
    return super.init({
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      max: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 10,
        min: 2,
      },
      owner: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      password: {
        type: Sequelize.STRING,
      },
    }, {
      sequelize,
      timestamps: true,
      underscored: false,
      modelName: 'Room',
      tableName: 'rooms',
      paranoid: true,
      charset: 'utf8',
      collate: 'utf8_general_ci'
    })
  }

  static associate(db) {
    db.Room.hasMany(db.Chat, {
      foreignKey: 'room', sourceKey: 'id',
    })
  }
}
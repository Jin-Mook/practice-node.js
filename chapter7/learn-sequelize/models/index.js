const Sequelize = require('sequelize');
const User = require('./user')
const Comment = require('./comment')

const env = process.env.NODE_ENV || 'development';
const config = require('../config/config.json')[env];
const db = {};

const sequelize = new Sequelize(config.database, config.username, config.password, config)

db.sequelize = sequelize;

db.User = User;
db.Comment = Comment;

User.init(sequelize)
Comment.init(sequelize)

// 관계정의시 user.js와 comment.js에 static associate부분을 설정한 경우 아래와 같이 쓰고
User.associate(db)
Comment.associate(db)
// 위에서 설정하지 않은 경우 index.js 폴더에서 직접 관계를 설정해 주어도 된다.
// db.User.hasMany(db.Comment, {foreignKey: 'commenter', sourceKey: 'id'})
// db.Comment.belongsTo(db.User, {foreignKey: 'commenter', targetKey: 'id'})

module.exports = db;

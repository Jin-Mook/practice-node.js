const passport = require('passport')
const local = require('./localStrategy');
const kakao = require('./kakaoStrategy');
const User = require('../models/user')

module.exports = () => {
  passport.serializeUser((user, done) => {
    done(null, user.id)
  })

  passport.deserializeUser((id, done) => {   // 에러가 없으면 req.user를 생성한후 저장한다.
    User.findOne({
      where: {id},
      include: [
        {
          model: User,
          attributes: ['id', 'nick'],
          as: 'Followers'
        },
        {
          model: User,
          attributes: ['id', 'nick'],
          as: 'Followings',
        },
      ]
    })
      .then(user => done(null, user))    // req.user 에 유저 정보 저장
      .catch(err => done(err))
  })

  local();
  kakao();
}
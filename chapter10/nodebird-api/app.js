const express = require('express')
const path = require('path')
const dotenv = require('dotenv')
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const passport = require('passport')
const nunjucks = require('nunjucks')
const {sequelize} = require('./models/index')
const passportConfig = require('./passport/index')

// 라우터 불러오기
const authRouter = require('./routes/auth')
const indexRouter = require('./routes/index')
const v1 = require('./routes/v1')
const v2 = require('./routes/v2')

dotenv.config()


app = express()
passportConfig()

app.set('port', process.env.PORT || 8002)
app.set('view engine', 'html');

nunjucks.configure('views', {
  express: app,
  watch: true,
});

sequelize.sync({ force: false })
  .then(() => {
    console.log('데이터베이스 연결 성공')
  })
  .catch((err) => {
    console.error(err)
  })

app.use(morgan('dev'))
app.use(express.static(path.join(__dirname, './public')))
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cookieParser(process.env.COOKIE_SECRET))
app.use(session({
  resave: false,
  saveUninitialized: false,
  secret: process.env.COOKIE_SECRET,
  cookie: {
    httpOnly: true,
    secure: false,
  }
}))
app.use(passport.initialize())
app.use(passport.session())

// 라우터 연결
app.use('/', indexRouter)
app.use('/auth', authRouter)
app.use('/v1', v1)
app.use('/v2', v2)



// 404 에러 처리 미들웨어
app.use((req, res, next) => {
  const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`)
  error.status = 404
  next(error)
})

// 에러 처리 미들웨어
app.use((err, req, res, next) => {
  res.locals.message = err.message
  res.locals.error = process.env.NODE_ENV !== 'production' ? err : {}
  res.status(err.status || 500)
  res.render('error')
})

app.listen(app.get('port'), () => {
  console.log(app.get('port'), '번 포트에서 대기 중')
})

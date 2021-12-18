const express = require('express')
const path = require('path')
const dotenv = require('dotenv')
const morgan = require('morgan')
const session = require('express-session')
const cookieParser = require('cookie-parser')
const passport = require('passport')
const nunjucks = require('nunjucks')
const fs = require('fs')

dotenv.config()
// 라우터 임포트하기
const indexRouter = require('./routes/index')
const authRouter = require('./routes/auth')

const {sequelize} = require('./models/index')
const passportconfig = require('./passport/index')
const sse = require('./sse')
const webSocket = require('./socket')
const checkAuction = require('./checkAuction')

const app = express()
app.set('port', process.env.PORT || 8010)
app.set('view engine', 'html')
nunjucks.configure('views', {
  express: app,
  watch: true,
})
sequelize.sync({force: false})
  .then(() => {
    console.log('데이터베이스 연결 성공')
  })
  .catch((err => {
    console.error(err)
  }))

const sessionMiddleware = session({
  resave: false,
  saveUninitialized: false,
  secret: process.env.COOKIE_SECRET,
  cookie: {
    httpOnly: true,
    secure: false,
  }
})

app.use(morgan('dev'))
app.use(express.static(path.join(__dirname, 'public')))
app.use('/img', express.static(path.join(__dirname, 'uploads')))
app.use(express.json())
app.use(express.urlencoded({extended: true}));
app.use(cookieParser(process.env.COOKIE_SECRET))
app.use(sessionMiddleware)
app.use(passport.initialize())
app.use(passport.session())
passportconfig()
checkAuction()

app.use('/', indexRouter)
app.use('/auth', authRouter)

app.use((req, res, next) => {
  const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`)
  error.status = 404
  next(error)
})

app.use((err, req, res, next) => {
  res.locals.message = err.message
  res.locals.error = process.env.NODE_ENV !== 'production' ? err : {}
  res.status(err.status || 500)
  res.render('error')
})

const server = app.listen(app.get('port'), () => {
  console.log(app.get('port'), '번 포트에서 대기 중')
  try {
    fs.readdirSync('uploads');
  } catch (error) {
    console.error('uploads 폴더가 없어 uploads 폴더를 생성합니다.')
    fs.mkdirSync('uploads')
  }
})

sse(server)
webSocket(server, app)
const express = require('express')
const path = require('path')
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const nunjucks = require('nunjucks')
const dotenv = require('dotenv')
const {sequelize} = require('./models/index')
const ColorHash = require('color-hash').default
const fs = require('fs')

dotenv.config()

// 라우터 가져오기
const indexRouter = require('./routes/index')
const webSocket = require('./socket')

const app = express();
app.set('port', process.env.PORT || 8005)
app.set('view engine', 'html')
nunjucks.configure('views', {
  express: app,
  watch: true,
})

sequelize.sync({force: false})
  .then(() => {
    console.log('데이터베이스 연결')
  })
  .catch((err) => {
    console.error(err)
  })

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
app.use('/gif', express.static(path.join(__dirname, 'uploads')))
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cookieParser(process.env.COOKIE_SECRET))
app.use(sessionMiddleware)

app.use((req, res, next) => {
  if (!req.session.color) {
    const colorHash = new ColorHash();
    req.session.color = colorHash.hex(req.sessionID)
  }
  next()
})


// 라우터 연결
app.use('/', indexRouter)

app.use((req, res, next) => {
  const  error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`)
  error.status = 404
  next(error)
})

app.use((err, req, res, next) => {
  res.locals.message = err.message
  res.locals.error = process.env.NODE_ENV !== 'production' ? err : {}
  res.status(err.status || 500);
  res.render('error')
})

const server = app.listen(app.get('port'), () => {
  console.log(app.get('port'), '번 포트에서 대기 중')
  try {
    fs.readdirSync('uploads')
  } catch (err) {
    console.error('uploads 폴더가 없어 uploads 폴더를 생성합니다.')
    fs.mkdirSync('uploads')
  }
})

webSocket(server, app, sessionMiddleware)
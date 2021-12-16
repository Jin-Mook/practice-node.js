const express = require('express')
const path = require('path')
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const nunjucks = require('nunjucks')
const dotenv = require('dotenv')

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

app.use(morgan('dev'))
app.use(express.static(path.join(__dirname, 'public')))
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
})

webSocket(server)
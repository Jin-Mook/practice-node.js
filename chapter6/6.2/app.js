const express = require('express')
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const dotenv = require('dotenv')
const path = require('path')

dotenv.config();
const app = express()
app.set('port', process.env.PORT || 3000)

app.use(morgan('dev'))
app.use('/', express.static(path.join(__dirname, 'public')))
app.use(express.json())
app.use(express.urlencoded({ extended: true}))
app.use(cookieParser(process.env.COOKIE_SECRET))
app.use(session({
  resave: false,
  saveUninitialized: false,
  secret: process.env.COOKIE_SECRET,
  cookie: {
    httpOnly: true,
    secure: false,
  },
  name: 'session-cookie',
}))

const multer = require('multer')
const fs = require('fs')

try {
  fs.readdirSync('uploads')
} catch (error) {
  console.error('uploads 폴더가 없어 uploads 폴더를 생성합니다.')
  fs.mkdirSync('uploads')
}

const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, done) {
      done(null, 'uploads/')
    },
    filename(req, file, done) {
      const ext = path.extname(file.originalname)
      done(null, path.basename(file.originalname, ext) + Date.now() + ext)
    },
  }),
  limits: {fileSize: 5 * 1024 * 1024},
})

app.get('/upload', (req, res) => {
  res.sendFile(path.join(__dirname, 'multipart.html'))
})

app.post('/upload',
  upload.fields([{name: 'image1'}, {name: 'image2'}]),
  (req, res) => {
    console.log(req.files, req.body)
    res.send('ok')
  },
)


app.use((req, res, next) => {
  console.log('모든 요청에 다 실행됩니다.')
  next()
})

app.get('/', (req, res, next) => {
  req.session.name = 'jjm'
  console.log(req.sessionID)
  console.log(req.session)
  req.session.destroy()
  console.log(req.session)
  res.sendFile(path.join(__dirname, 'index.html'))
  console.log('GET / 요청에서만 실행됩니다.')
  // next('route')
}, (req, res) => {
  throw new Error('에러는 에러 처리 미들웨어로 갑니다.')
})

// 앞에 있는 라우터에서 next('route')를  이용한 경우
app.get('/', (req, res, next) => {
  res.send('next route')
})

app.get('/checkcookie', (req, res, next) => {
  console.log(req.session)
  if (req.session.num === undefined) {
    req.session.num = 1
  } else {
    req.session.num += 1
  }
  res.send(`View : ${req.session.num}`)
})

app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).send(err.message)
})

app.listen(app.get('port'), () => {
  console.log(`${app.get('port')}번 포트에서 대기 중`)
})
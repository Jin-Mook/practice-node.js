const path = require('path')
const express = require('express')
const dotenv = require('dotenv')
const nunjucks = require('nunjucks')

dotenv.config()

const indexRouter = require(path.join(__dirname, './routes/index.js'))
const userRouter = require(path.join(__dirname, './routes/user.js'))

app = express()
app.set('port', process.env.PORT || 3000)
app.set('view engine', 'html')

nunjucks.configure('views', {
  express: app,
  watch: true,
})

app.use('/', indexRouter)
app.use('/user', userRouter)

app.use((req, res, next) => {
  // res.status(404).send('Not Found')
  const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`)
  error.status = 404
  console.log('not found')
  next(error)
})

app.use((err, req, res, next) => {
  res.locals.message = err.message
  res.locals.error = err
  // console.dir(err.stack)
  res.status(err.status || 500)
  res.render('error')
})

app.listen(app.get('port'), () => {
  console.log(`${app.get('port')}번 포트에서 대기 중`)
})
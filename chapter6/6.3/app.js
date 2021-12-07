const path = require('path')
const express = require('express')
const dotenv = require('dotenv')

dotenv.config()

const indexRouter = require(path.join(__dirname, './index.js'))
const userRouter = require(path.join(__dirname, './user.js'))

app = express()
app.set('port', process.env.PORT || 3000)

app.use('/', indexRouter)
app.use('/user', userRouter)

app.use((req, res, next) => {
  res.status(404).send('Not Found')
  console.log('not found')
})

app.listen(app.get('port'), () => {
  console.log(`${app.get('port')}번 포트에서 대기 중`)
})
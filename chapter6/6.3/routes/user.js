const express = require('express')

const router = express.Router()

// GET /user 라우터
router.get('/', (req, res) => {
  res.send('Hello User')
})

router.get('/:id', (req, res) => {
  console.log(req.params, req.query)
  res.send(`${req.params.id}입니다.`)
})

module.exports = router
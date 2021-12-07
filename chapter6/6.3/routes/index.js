const express = require('express')

const router = express.Router()

// GET / 라우터
router.get('/', (req, res) => {
  res.render('index', {title: 'jinmook'})
})

module.exports = router
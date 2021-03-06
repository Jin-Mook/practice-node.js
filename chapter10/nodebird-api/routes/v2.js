const express = require('express')
const jwt = require('jsonwebtoken')
const cors = require('cors')
const url = require('url')

const {verifyToken, apiLimiter} = require('./middlewares')
const {Domain, User, Hashtag, Post} = require('../models/index')

const router = express.Router()

router.use(async (req, res, next) => {
  console.log(req.headers.origin)  // 아래 req.get('origin') 과 동일하다.
  console.log(url.parse(req.get('origin')))
  const domain = await Domain.findOne({
    where: {host: url.parse(req.get('origin')).host}
  })
  if (domain) {
    cors({
      origin: req.get('origin'),
      credentials: true,
    })(req, res, next);
  } else {
    next()
  }
})

router.post('/token', async (req, res) => {
  const {clientSecret} = req.body
  try {
    const domain = await Domain.findOne({
      where : { clientSecret },
      include: {
        model: User,
        attributes: ['id', 'nick']
      }
    })
    
    if (!domain) {
      return res.status(401).json({
        code: 401,
        message: '등록되지 않은 도메인입니다. 먼저 도메인을 등록하세요',
      })
    }
    
    const token = jwt.sign({
      id: domain.User.id,
      nick: domain.User.nick,
    }, process.env.JWT_SECRET, {
      expiresIn: '1m',
      issuer: 'nodebird',
    })

    return res.json({
      code: 200,
      message: '토큰이 발급되었습니다',
      token
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      code: 500,
      message: '서버 에러',
    })
  }
})

router.get('/test', verifyToken, apiLimiter, (req, res, next) => {
  res.json(req.decoded)
})


router.get('/posts/my', verifyToken, apiLimiter, (req, res, next) => {
  console.log(req.decoded)
  Post.findAll({ where: {UserId: req.decoded.id}})
    .then((posts) => {
      console.log(posts)
      res.json({
        code: 200,
        payload: posts,
      })
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({
        code: 500,
        message: '서버 에러'
      })
    })
})


router.get('/posts/hashtag/:title', verifyToken, apiLimiter, async (req, res, next) => {
  try {
    console.log(decodeURIComponent(req.params.title))
    const hashtag = await Hashtag.findOne({
      where: {title: decodeURIComponent(req.params.title)}
    })
    if (!hashtag) {
      return res.status(404).json({
        code: 404,
        message: '검색 결과가 없습니다.'
      })
    }
    const posts = await hashtag.getPosts();
    return res.json({
      code: 200,
      payload: posts,
    })
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      message: '서버 에러',
    })
  }
})


module.exports = router
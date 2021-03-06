const express = require('express')
const Room = require('../models/room')
const Chat = require('../models/chat')
const multer = require('multer')
const path = require('path')

const router = express.Router()

const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, done) {
      done(null, 'uploads/')
    },
    filename(req, file, done) {
      const ext = path.extname(file.originalname);
      done(null, path.basename(file.originalname, ext) + Date.now() + ext);
    }
  }),
  limits: {fileSize: 20 * 1024 * 1024},
})

router.post('/room/:id/gif', upload.single('gif'), async (req, res, next) => {
  try {
    const chat = await Chat.create({
      room: req.params.id,
      user: req.session.color,
      gif: req.file.filename,
    })
    req.app.get('io').of('/chat').to(req.params.id).emit('chat', chat)
    res.send('ok')
  } catch (error) {
    console.log('에러')
    console.error(error)
    next(error)
  }
})

router.get('/', async (req, res, next) => {
  try {
    const rooms = await Room.findAll({})
    res.render('main', {rooms, title: 'GIF 채팅방'})
  } catch (error) {
    console.log(error)
    next(error)
  }
})

router.get('/room', (req, res, next) => {
  res.render('room', {title: 'GIF 채팅방 생성'})
})

router.post('/room', async (req, res, next) => {
  try {
    const newRoom = await Room.create({
      title: req.body.title,
      max: req.body.max,
      owner: req.session.color,
      password: req.body.password,
    })
    const io = req.app.get('io')
    io.of('/room').emit('newRoom', newRoom);
    res.redirect(`/room/${newRoom.id}?password=${req.body.password}`)
  } catch (error) {
    console.error(error)
    next(error)
  }
})

router.get('/room/:id', async (req, res, next) => {
  try {
    const room = await Room.findOne({ where: {id: req.params.id}})
    const io = req.app.get('io')
    if (!room) {
      return res.redirect('/?error=존재하지 않는 방입니다.')
    }
    if (room.password && room.password !== req.query.password) {
      return res.redirect('/?error=비밀번호가 틀렸습니다.')
    }
    const {rooms} = io.of('/chat').adapter
    console.log(rooms)
    if (rooms && rooms[req.params.id] && room.max <= rooms[req.params.id].length) {
      return res.redirect('/?error=허용 인원을 초과했습니다.')
    }
    const chats = await room.getChats({order: [['createdAt', 'ASC']]})
    return res.render('chat', {
      room,
      title: room.title,
      chats,
      user: req.session.color,
    })
  } catch (error) {
    console.error(error)
    return next(error)
  }
})

router.delete('/room/:id', async (req, res, next) => {
  try {
    await Room.destroy({
      where: {
        id: req.params.id
      }
    })
    await Chat.destroy({
      where: {
        room: req.params.id
      }
    })
    res.send('ok')
    setTimeout(() => {
      req.app.get('io').of('/room').emit('removeRoom', req.params.id)
    }, 2000)
  } catch (error) {
    console.error(error)
    next(error)
  }
})

router.post('/room/:id/chat', async (req, res, next) => {
  try {
    const chat = await Chat.create({
      room: req.params.id,
      user: req.session.color,
      chat: req.body.chat
    })
    req.app.get('io').of('/chat').to(req.params.id).emit('chat', chat)
    res.send('ok');
  } catch (error) {
    console.error(error);
    next(error)
  }
})


module.exports = router;
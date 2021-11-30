process.on('uncaughtException', (error) => {
  console.error('예기치 못한 에러', error)
  // process.exit()
})

setInterval(() => {
  throw new Error('서버를 고장내주마!')
}, 1000)

setTimeout(() => {
  console.log('실행됩니다.')
}, 2000)
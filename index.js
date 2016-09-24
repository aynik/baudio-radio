const http = require('http')
const respawn = require('respawn')
const icy = require('icy')

const until = (src, feid, dst) => {
  const handlers = {}
  src.on(feid, _ => (
    Object.keys(handlers).map(eid =>
      dst.removeListener(eid, handlers[eid]))
  ))
  const cont = {
    on (eid, handler) {
      handlers[eid] = handler
      dst.on(eid, handler)
      return cont
    }
  }
  return cont
}

const loop = respawn(['./bin/play-list', process.argv[2]])
loop.start()

const server = http.createServer((req, res) => {
  const injector = new icy.Writer(8192)

  const info = buf => {
    console.log(buf.toString().split('\n')[0])
    return injector.queue(buf.toString().split('\n')[0])
  }

  const write = buf => (
    injector.write(buf)
  )

  res.setHeader('ice-audio-info',
    'ice-samplerate=44100;ice-bitrate=128;ice-channels=2')

  res.setHeader('icy-description',
    '1ECWbuvHg8Mex7p29QRUeamNHgTSC7h6Gv')

  res.setHeader('icy-br', '128')
  res.setHeader('icy-genre', 'Chillwave')
  res.setHeader('icy-name', process.env.NAME)
  res.setHeader('icy-pub', '0')
  res.setHeader('icy-url', 'https://baudio.co')
  res.setHeader('icy-metaint', '8192')
  res.setHeader('Content-Type', 'audio/mp3')

  until(res, 'close', loop)
    .on('stderr', info)
    .on('stdout', write)

  injector.pipe(res)
})

server.listen(process.env.PORT || 8888, '0.0.0.0')

import * as express from 'express'
import * as expressWs from 'express-ws'
import * as dotenv from 'dotenv'
import rtspRelay = require('rtsp-relay')

dotenv.config({ path: './apps/rtsp-proxy/.env' })

const app = express()
const { app: appWs } = expressWs(app)

const { proxy } = rtspRelay(app)

appWs.ws('/stream/camera', (ws, req) => {
  return proxy({
    url: req.query.rtsp.toString()
  })(ws)
})

const port = +process.env.APP_PORT || 3333

const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`)
})

server.on('error', console.error)

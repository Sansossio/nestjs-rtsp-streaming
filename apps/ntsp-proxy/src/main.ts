import * as express from 'express'
import * as dotenv from 'dotenv'
import { RTSP_CAMERAS } from '@nestjs-rtsp-streaming/cameras'
import rtspRelay = require('rtsp-relay')

dotenv.config({ path: './apps/ntsp-proxy/.env' })

const app = express()

const { proxy } = rtspRelay(app)

;(app as any).ws('/stream/camera/:name', (ws, req) => {
  return proxy({
    url: RTSP_CAMERAS.find(camera => camera.name === req.params.name).input
  })(ws)
})

const port = +process.env.APP_PORT || 3333

const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`)
})

server.on('error', console.error)

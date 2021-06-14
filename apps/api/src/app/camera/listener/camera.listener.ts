import { RtspSubscriber } from '@nestjs-rtsp-streaming/rtsp'
import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { RTSP_CAMERAS } from '../camera.config'

@WebSocketGateway()
export class CameraListener {
  @WebSocketServer() server: Server

  constructor () {
    this.initializeAllStreamins()
  }

  private initializeAllStreamins () {
    for (const server of RTSP_CAMERAS) {
      const subscribe = new RtspSubscriber({
        ffmpegCmd: './bin/ffmpeg.exe',
        streamingConfig: {
          input: server.input
        }
      })

      subscribe
        .connect()
        .subscribe(async buffer => this.handleStream(server.name, buffer))
    }
  }

  private async handleStream (name: string, buffer: Buffer) {
    const room = `camera-${name}`

    this.server.to(room).emit('camera-data', { name, buffer })
  }

  @SubscribeMessage('get-cameras')
  getStream (client: Socket) {
    client.emit('cameras', RTSP_CAMERAS.map(c => c.name))
  }
}

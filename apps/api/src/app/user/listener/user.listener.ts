import { RtspSubscriber } from '@nestjs-rtsp-streaming/rtsp'
import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'

const DEFAULT_RTSP_STREAM = 'rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_115k.mov'

@WebSocketGateway()
export class UserListener {
  private subscribeUserToStream (client: Socket) {
    const subscribe = new RtspSubscriber({
      ffmpegCmd: './bin/ffmpeg.exe',
      streamingConfig: {
        input: DEFAULT_RTSP_STREAM,
        resolution: '500x500',
        quality: 3
      }
    })

    subscribe
      .listen()
      .subscribe((buffer) => {
        client.emit('video-data', { buffer })
      })
  }

  @WebSocketServer()
  server: Server

  @SubscribeMessage('get-stream')
  getStream (client: Socket) {
    this.subscribeUserToStream(client)
  }
}

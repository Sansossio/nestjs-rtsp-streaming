import { RtspSubscriber } from '@nestjs-rtsp-streaming/rtsp'
import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { UsersUserListenerDto } from './user.user-listener.dto'

const ALL_RTSP_SERVERS = [
  {
    name: 'random',
    input: 'rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_115k.mov'
  }
]

@WebSocketGateway()
export class UserListener {
  constructor () {
    this.initializeAllStreamins()
  }

  private readonly usersList: UsersUserListenerDto[] = []

  private initializeAllStreamins () {
    for (const server of ALL_RTSP_SERVERS) {
      const subscribe = new RtspSubscriber({
        ffmpegCmd: './bin/ffmpeg.exe',
        streamingConfig: {
          input: server.input,
          resolution: '500x500',
          quality: 3
        }
      })

      subscribe
        .connect()
        .subscribe(async buffer => this.handleStream(server.name, buffer))
    }
  }

  private async handleStream (name: string, buffer: Buffer) {
    const channel = `camera-${name}`
    await Promise.all(
      this.usersList.map(async (user, index) => {
        if (!user.connectedTo.includes(name)) {
          return
        }
        if (!user.client.connected) {
          this.usersList.splice(index, 1)
          return
        }
        user.client.emit('video-data', { channel, buffer })
      })
    )
  }

  @WebSocketServer()
  server: Server

  @SubscribeMessage('get-stream')
  getStream (client: Socket, channel: string) {
    const existsIndex = this.usersList.findIndex(u => u.clientId === client.id)
    if (existsIndex > -1) {
      this.usersList[existsIndex].connectedTo.push(channel)
      return
    }
    this.usersList.push({
      clientId: client.id,
      client,
      connectedTo: [channel]
    })
  }
}

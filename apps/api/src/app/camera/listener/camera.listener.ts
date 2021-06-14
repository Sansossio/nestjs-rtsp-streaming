import { RtspSubscriber } from '@nestjs-rtsp-streaming/rtsp'
import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets'
import { Socket } from 'socket.io'
import { RTSP_CAMERAS } from '../camera.config'
import { UserCameraListenerDto } from './user.camera-listener.dto'

@WebSocketGateway()
export class CameraListener {
  constructor () {
    this.initializeAllStreamins()
  }

  private readonly usersList: UserCameraListenerDto[] = []

  private initializeAllStreamins () {
    for (const server of RTSP_CAMERAS) {
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

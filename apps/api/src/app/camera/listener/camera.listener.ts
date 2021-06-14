import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { Inject } from '@nestjs/common'
import { GET_CAMERAS_PROVIDER_KEY, InstacedCamera } from '../provider/get-cameras.provider'

@WebSocketGateway()
export class CameraListener {
  @WebSocketServer() private readonly server: Server

  constructor (
    @Inject(GET_CAMERAS_PROVIDER_KEY)
    private readonly cameras: InstacedCamera[]
  ) {
    void this.detectMotion()
  }

  private getRoomFromCameraName (name: string) {
    return `camera-${name}`
  }

  private async detectMotion () {
    for (const server of this.cameras) {
      if (!server.player) {
        continue
      }
      server.player
        .motionSensor()
        .subscribe((motion) => {
          this.server.to(this.getRoomFromCameraName(server.name)).emit('camera-motion-sensor', {
            name: server.name,
            motion
          })
        })
    }
  }

  @SubscribeMessage('get-cameras')
  getStream (client: Socket) {
    client.emit('cameras', this.cameras.map(cam => ({
      name: cam.name,
      rtsp: cam.rtsp
    })))
  }
}

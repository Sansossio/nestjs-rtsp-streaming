import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { CAMERAS_CONFIG } from '../camera.config'
import { Onvif } from '@nestjs-rtsp-streaming/onvif'

@WebSocketGateway()
export class CameraListener {
  private camerasRtsp: { onvif?: Onvif, name: string, input: string }[] = []

  @WebSocketServer() private readonly server: Server

  constructor () {
    void this.initializeCameras()
  }

  private getRoomFromCameraName (name: string) {
    return `camera-${name}`
  }

  private async initializeCameras () {
    this.camerasRtsp = await Promise.all(
      CAMERAS_CONFIG.map(async (camera) => {
        if (camera.rtsp) {
          return {
            name: camera.name,
            input: camera.rtsp
          }
        }
        const onvif = new Onvif(camera.connection)
        await onvif.connect()
        return {
          onvif,
          name: camera.name,
          input: await onvif.getRtspUrl()
        }
      })
    )

    void this.detectMotion()
  }

  private async detectMotion () {
    for (const server of this.camerasRtsp) {
      if (!server.onvif) {
        continue
      }
      server.onvif
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
    client.emit('cameras', this.camerasRtsp)
  }
}

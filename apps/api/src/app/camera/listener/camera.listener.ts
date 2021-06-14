import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { RtspSubscriber } from '@nestjs-rtsp-streaming/rtsp'
import { CAMERAS_CONFIG } from '../camera.config'
import { Onvif } from '@nestjs-rtsp-streaming/onvif'

@WebSocketGateway()
export class CameraListener {
  private camerasRtsp: { onvif?: Onvif, name: string, input: string }[] = []

  @WebSocketServer() private readonly server: Server

  constructor () {
    void this.initializeCameras()
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

    void this.sendRtspToSockets()
    void this.detectMotion()
  }

  private async sendRtspToSockets () {
    for (const server of this.camerasRtsp) {
      const subscribe = new RtspSubscriber({})

      subscribe
        .getVideoBuffer({
          input: server.input
        })
        .subscribe(async buffer => this.handleStream(server.name, buffer))
    }
  }

  private async detectMotion () {
    for (const server of this.camerasRtsp) {
      if (!server.onvif) {
        continue
      }
      server.onvif
        .motionSensor()
        .subscribe((motion) => {
          console.log({
            camera: server.name,
            motion
          })
        })
    }
  }

  private async handleStream (name: string, buffer: Buffer) {
    const room = `camera-${name}`

    this.server.to(room).emit('camera-data', { name, buffer })
  }

  @SubscribeMessage('get-cameras')
  getStream (client: Socket) {
    client.emit('cameras', this.camerasRtsp)
  }
}

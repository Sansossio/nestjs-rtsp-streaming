import { Cam } from 'onvif'
import { RegisterCamera } from './dto/register-camera'
import { Observable } from 'rxjs'
import { GetDevice } from './type'

const DEFAULT_ONVIF_PORT = 2020
const IS_MOTION_EVENT_NAME = 'IsMotion'

export class Onvif {
  private camInstance: Cam

  constructor (
    private readonly config: RegisterCamera
  ) {}

  private parseRtspUri (uri: string) {
    if (!this.config.username || !this.config.password) {
      return uri
    }

    const credentials = `rtsp://${this.config.username}:${this.config.password}@`
    return uri.replace(/rtsp:\/\//gm, credentials)
  }

  async connect () {
    return new Promise<void>((resolve, reject) => {
      if (this.camInstance) {
        resolve()
        return
      }
      this.camInstance = new Cam({
        port: DEFAULT_ONVIF_PORT,
        ...this.config
      }, (err) => {
        if (err) {
          reject(err)
          return
        }
        resolve()
      })
    })
  }

  async getDeviceCustomName (): Promise<string> {
    const info = await this.getDeviceInformation()
    return `${info.manufacturer}-${info.model}-${info.serialNumber}`
  }

  async getDeviceInformation (): Promise<GetDevice> {
    return new Promise<any>((resolve, reject) => {
      this.camInstance.getDeviceInformation((err, data) => {
        if (err) {
          reject(err)
          return
        }
        resolve(data)
      })
    })
  }

  async getRtspUrl (): Promise<string> {
    return new Promise((resolve, reject) => {
      this.camInstance.getStreamUri({ protocol: 'RTSP' }, (err, { uri }) => {
        if (err) {
          reject(err)
          return
        }
        resolve(this.parseRtspUri(uri))
      })
    })
  }

  motionSensor (): Observable<boolean> {
    return new Observable((subscriber) => {
      this.camInstance.on('event', (event) => {
        const {
          Name: name,
          Value: val
        } = event.message.message.data.simpleItem.$
        if (name !== IS_MOTION_EVENT_NAME) {
          return
        }
        subscriber.next(val)
      })
    })
  }
}

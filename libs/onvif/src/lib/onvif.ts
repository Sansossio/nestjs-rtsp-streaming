import { Cam } from 'onvif'
import { RegisterCamera } from './dto/register-camera'

const DEFAULT_ONVIF_PORT = 2020

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

  async getRtspUrl () {
    return new Promise<string>((resolve, reject) => {
      this.camInstance.getStreamUri({ protocol: 'RTSP' }, (err, { uri }) => {
        if (err) {
          reject(err)
          return
        }
        resolve(this.parseRtspUri(uri))
      })
    })
  }
}

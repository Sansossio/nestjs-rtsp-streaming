import { Discovery } from 'onvif'
import { Onvif } from './onvif'

export class OnvifDiscovery {
  static async searchCams (username?: string, password?: string): Promise<Onvif[]> {
    return new Promise((resolve, reject) => {
      Discovery.probe((err, cams) => {
        if (err) {
          reject(err)
          return
        }
        const camInstances = cams.map(
          (cam) => new Onvif({
            hostname: cam.hostname,
            port: cam.port,
            username,
            password
          })
        )
        resolve(camInstances)
      })
    })
  }
}

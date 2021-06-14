import { Provider } from '@nestjs/common'
import { Onvif, OnvifDiscovery } from '@nestjs-rtsp-streaming/onvif'

export const GET_CAMERAS_PROVIDER_KEY = Symbol('GET_CAMERAS_PROVIDER_KEY')

export interface InstacedCamera {
  name: string
  player?: Onvif
  rtsp?: string
}

const DEFAULT_CREDENTIALS = {
  username: 'testing',
  password: 'testing'
}

const FIXED_CAMERAS: InstacedCamera[] = [
  {
    name: 'random',
    rtsp: 'rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_115k.mov'
  }
]

export const getCamerasProvider: Provider = {
  provide: GET_CAMERAS_PROVIDER_KEY,
  useFactory: async (): Promise<InstacedCamera[]> => {
    const cams = await OnvifDiscovery.searchCams(
      DEFAULT_CREDENTIALS.username,
      DEFAULT_CREDENTIALS.password
    )

    const response: InstacedCamera[] = await Promise.all(
      cams.map(async (cam) => {
        await cam.connect()
        return {
          name: await cam.getDeviceCustomName(),
          rtsp: await cam.getRtspUrl(),
          player: cam
        }
      })
    )

    response.push(...FIXED_CAMERAS)

    return response
  }
}

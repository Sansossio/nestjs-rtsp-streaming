import { Module } from '@nestjs/common'
import { CameraListener } from './listener/camera.listener'
import { getCamerasProvider } from './provider/get-cameras.provider'

@Module({
  providers: [
    getCamerasProvider,
    CameraListener
  ]
})
export class CameraModule {}

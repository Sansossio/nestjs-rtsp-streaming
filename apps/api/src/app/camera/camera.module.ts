import { Module } from '@nestjs/common'
import { CameraListener } from './listener/camera.listener'

@Module({
  providers: [
    CameraListener
  ]
})
export class CameraModule {}

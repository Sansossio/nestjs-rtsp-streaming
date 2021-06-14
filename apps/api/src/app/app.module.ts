import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import config from '../../config'
import { CameraModule } from './camera/camera.module'
import { join } from 'path'
import { ServeStaticModule } from '@nestjs/serve-static'

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: './apps/api/.env',
      load: config
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, 'assets', 'html')
    }),
    CameraModule
  ]
})
export class AppModule {}

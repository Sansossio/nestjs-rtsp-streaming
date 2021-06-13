import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import config from '../../config'

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: './apps/api/.env',
      load: config
    })
  ]
})
export class AppModule {}

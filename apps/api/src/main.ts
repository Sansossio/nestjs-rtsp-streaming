import { Logger } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { ConfigService } from '@nestjs/config'

import { AppModule } from './app/app.module'

const GLOBAL_PREFIX = 'api'

async function bootstrap () {
  const app = await NestFactory.create(AppModule)

  const configService = app.get(ConfigService)

  app.setGlobalPrefix(GLOBAL_PREFIX)

  const port = configService.get<number>('app.port')

  await app.listen(port, () => {
    Logger.log(`Listening at http://localhost:${port}/${GLOBAL_PREFIX}`)
  })
}

void bootstrap()

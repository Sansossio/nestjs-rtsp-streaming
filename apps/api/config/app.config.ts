import { registerAs } from '@nestjs/config'

export const appConfig = registerAs('app', () => ({
  port: +process.env.APP_PORT
}))

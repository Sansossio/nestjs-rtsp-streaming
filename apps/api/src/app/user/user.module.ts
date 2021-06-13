import { Module } from '@nestjs/common'
import { UserListener } from './listener/user.listener'

@Module({
  providers: [
    UserListener
  ]
})
export class UserModule {}

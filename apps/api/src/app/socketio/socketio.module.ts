import { Module } from '@nestjs/common'
import { ScheduleModule } from '@nestjs/schedule'
import { SocketIOBasicEvents } from './events/socketio.basic-events'

@Module({
  imports: [
    ScheduleModule.forRoot()
  ],
  providers: [
    SocketIOBasicEvents
  ]
})
export class SocketIOModule {}

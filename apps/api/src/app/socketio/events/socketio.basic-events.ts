import { Interval } from '@nestjs/schedule'
import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
import { Socket, Server } from 'socket.io'

const ONLINE_USERS_INVERTAL = 1 * 1000 // 1 second

@WebSocketGateway()
export class SocketIOBasicEvents {
  @WebSocketServer() server: Server

  @Interval(ONLINE_USERS_INVERTAL)
  onlineUsers () {
    this.server.emit('online-users', this.server.engine.clientsCount)
  }

  @SubscribeMessage('join-to-room')
  joinToRoom (client: Socket, room: string) {
    void client.join(room)
  }
}

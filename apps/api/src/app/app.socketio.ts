import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets'
import { Socket } from 'socket.io'

@WebSocketGateway()
export class AppSocketIO {
  @SubscribeMessage('join-to-room')
  joinToRoom (client: Socket, room: string) {
    void client.join(room)
  }
}

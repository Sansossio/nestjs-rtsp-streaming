import { Socket } from 'socket.io'

export class UsersUserListenerDto {
  clientId: string
  client: Socket
  connectedTo: string[]
}

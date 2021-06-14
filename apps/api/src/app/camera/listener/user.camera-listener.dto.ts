import { Socket } from 'socket.io'

export class UserCameraListenerDto {
  clientId: string
  client: Socket
  connectedTo: string[]
}

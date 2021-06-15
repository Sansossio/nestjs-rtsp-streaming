import { plainToClass } from 'class-transformer'

export class GetDevice {
  readonly fimwareVersion: string
  readonly hardwareId: number
  readonly manufacturer: string
  readonly model: string
  readonly serialNumber: string

  static fromData (data): GetDevice {
    return plainToClass(GetDevice, data)
  }
}

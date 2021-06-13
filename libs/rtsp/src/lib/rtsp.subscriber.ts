import { Injectable, Logger } from '@nestjs/common'
import { spawn } from 'child_process'
import { Observable } from 'rxjs'
import { RtspConfig } from './rtsp.config'

const DEFAULT_FFMPEG_CMD = 'ffmpeg'
const LOGGER_CONTEXT = 'RTSP_SUBSCRIBER'

@Injectable()
export class RtspSubscriber {
  private readonly ffmpegCmd: string = this.config.ffmpegCmd || DEFAULT_FFMPEG_CMD
  private readonly logger = new Logger(LOGGER_CONTEXT)

  constructor (private readonly config: RtspConfig) {
    this.setDefaultConfigValues()
  }

  private setDefaultConfigValues () {
    this.config.streamingConfig.rate = this.config.streamingConfig.rate || 10
  }

  private getArgs () {
    const {
      streamingConfig: {
        input: url,
        quality,
        rate,
        resolution
      }
    } = this.config
    return [
      '-loglevel', 'quiet',
      '-i', url,
      '-r', rate.toString(),
      ...(quality ? ['-q:v', quality.toString()] : []),
      ...(resolution ? ['-s', resolution] : []),
      '-f', 'image2',
      '-update', '1',
      '-'
    ]
  }

  listen (): Observable<Buffer> {
    return new Observable((subscribe) => {
      const command = spawn(this.ffmpegCmd, this.getArgs())

      command.stdout.on('data', (data) => {
        if (data.length <= 1) {
          return
        }
        const buff = Buffer.concat([Buffer.from(''), data])

        const offset = data[data.length - 2].toString(16)
        const offset2 = data[data.length - 1].toString(16)

        if (offset !== 'ff' || offset2 !== 'd9') {
          return
        }
        subscribe.next(buff)
      })

      command.stderr.on('data', data => this.logger.error(data))
      command.on('error', data => this.logger.error(data))
      command.on('close', code => this.logger.warn(`Close with code ${code}`))
    })
  }
}

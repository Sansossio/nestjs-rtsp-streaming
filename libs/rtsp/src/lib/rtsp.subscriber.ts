import { Injectable, Logger } from '@nestjs/common'
import { spawn } from 'child_process'
import { Observable, of } from 'rxjs'
import { mergeMap } from 'rxjs/operators'
import { RtspConfig } from './rtsp.config'

const DEFAULT_FFMPEG_CMD = 'ffmpeg'
const LOGGER_CONTEXT = 'RtspSubscriber'

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
      ...(quality !== undefined ? ['-q:v', quality.toString()] : []),
      ...(resolution ? ['-s', resolution] : []),
      '-f', 'image2',
      '-update', '1',
      '-'
    ]
  }

  private connectToServer () {
    this.logger.log(`Trying connect to server: ${this.config.streamingConfig.input}`)
    let connected = false
    return new Observable<{ buffer?: Buffer, error: boolean }>((subscribe) => {
      const command = spawn(this.ffmpegCmd, this.getArgs())

      command.stdout.on('data', (data) => {
        if (!connected) {
          this.logger.log(`Connected to server: ${this.config.streamingConfig.input}`)
        }

        connected = true

        if (data.length <= 1) {
          return
        }

        const buffer = Buffer.concat([Buffer.from(''), data])

        const offset = data[data.length - 2].toString(16)
        const offset2 = data[data.length - 1].toString(16)

        if (offset !== 'ff' || offset2 !== 'd9') {
          return
        }
        subscribe.next({ buffer, error: false })
      })

      command.stderr.on('data', data => {
        this.logger.error(data)
        subscribe.next({ error: true })
      })
      command.on('error', data => {
        this.logger.error(data)
        subscribe.next({ error: true })
      })
      command.on('close', code => {
        this.logger.warn(`Close with code ${code}`)
        subscribe.next({ error: true })
      })
    })
  }

  connect (): Observable<Buffer> {
    return new Observable((subscribe) => {
      this.connectToServer()
        .pipe(
          mergeMap((data) => {
            if (data.error) {
              return this.connect()
            }
            return of(data)
          })
        )
        .subscribe(data => subscribe.next(data.buffer as Buffer))
    })
  }
}

import { Injectable, Logger } from '@nestjs/common'
import { spawn } from 'child_process'
import { Observable, of } from 'rxjs'
import { filter, map, mergeMap, skipWhile } from 'rxjs/operators'
import { ConnectRtspDto } from './dto/connect.rtsp.dto'
import { RtspConfig } from './rtsp.config'

const DEFAULT_FFMPEG_CMD = 'ffmpeg'
const LOGGER_CONTEXT = 'RtspSubscriber'

// https://community.openhab.org/t/how-to-turn-a-cameras-rtsp-stream-into-motion-detection/89906
const DETECT_MOVEMENT_SENSOR = 0.1

@Injectable()
export class RtspSubscriber {
  private readonly ffmpegCmd: string = this.config.ffmpegCmd || DEFAULT_FFMPEG_CMD
  private readonly logger = new Logger(LOGGER_CONTEXT)

  constructor (private readonly config: RtspConfig) {}

  private connectToServer (args: string[], server: string) {
    this.logger.log(`Trying connect to server: ${server}`)
    let connected = false
    return new Observable<{ buffer?: Buffer, error: boolean }>((subscribe) => {
      const command = spawn(this.ffmpegCmd, args)
      command.stdout.on('data', (data) => {
        if (!connected) {
          this.logger.log(`Connected to server: ${server}`)
        }
        connected = true

        subscribe.next({ buffer: data, error: false })
      })

      command.stderr.on('data', data => {
        subscribe.next({ error: true, buffer: data })
      })
      command.on('error', () => {
        subscribe.next({ error: true })
      })
      command.on('close', code => {
        this.logger.warn(`Close with code ${code}`)
        subscribe.next({ error: true })
      })
    })
  }

  motionSensor (input: string) {
    const args = [
      '-rtsp_transport', 'tcp',
      '-i', input,
      '-vf', `select='gte(scene\\,${DETECT_MOVEMENT_SENSOR})',metadata=print`,
      '-an',
      '-f',
      'null',
      '-'
    ]
    return this.connectToServer(args, input)
      .pipe(
        skipWhile(data => data.error && !data.buffer),
        map((data): string[] => {
          const text = data?.buffer.toString()
          return text.match(/lavfi\.scene_score=(.*)/gm)
        }),
        filter(val => !!val),
        map(() => true)
      )
  }

  getVideoBuffer (config: ConnectRtspDto): Observable<Buffer> {
    const {
      input: url,
      quality,
      rate = 10,
      resolution
    } = config
    const args = [
      '-loglevel', 'quiet',
      '-i', url,
      '-r', rate.toString(),
      ...(quality !== undefined ? ['-q:v', quality.toString()] : []),
      ...(resolution ? ['-s', resolution] : []),
      '-f', 'image2',
      '-update', '1',
      '-'
    ]
    return this.connectToServer(args, config.input)
      .pipe(
        skipWhile((data) => {
          if (!data.buffer) {
            return false
          }

          if (data.buffer.length <= 1) {
            return
          }

          const offset = data.buffer[data.buffer.length - 2].toString(16)
          const offset2 = data.buffer[data.buffer.length - 1].toString(16)

          if (offset !== 'ff' || offset2 !== 'd9') {
            return true
          }

          return false
        }),
        mergeMap((data) => {
          if (data.error) {
            return this.getVideoBuffer(config)
          }
          return of(data)
        }),
        map((data) => data.buffer as Buffer)
      )
  }
}

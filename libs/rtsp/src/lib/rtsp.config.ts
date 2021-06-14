export interface RtspConfig {
  /**
   * Path of ffmpeg binary
   * @default ffmpeg
   */
  ffmpegCmd?: string
}

export const RTSP_CONFIG_KEY = Symbol('RTSP_CONFIG_KEY')

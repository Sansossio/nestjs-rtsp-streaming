export interface RtspConfig {
  /**
   * Path of ffmpeg binary
   * @default ffmpeg
   */
  ffmpegCmd?: string
  streamingConfig: {
    input: string
    /**
     * @default 10
     */
    rate?: number
    quality?: string | number
    /**
     * @example 800x600
     */
    resolution?: string
  }
}

export const RTSP_CONFIG_KEY = Symbol('RTSP_CONFIG_KEY')

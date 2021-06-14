export interface ConnectRtspDto {
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

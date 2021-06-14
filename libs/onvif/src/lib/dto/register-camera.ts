export interface RegisterCamera {
  hostname: string
  username?: string
  password?: string
  /**
   * @default 2020 TP Link default onvif port
   */
  port?: number
}

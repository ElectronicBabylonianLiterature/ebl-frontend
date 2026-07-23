export default class AbortableOperation {
  private controller: AbortController | null = null

  start(): AbortSignal {
    this.abort()
    this.controller = new AbortController()
    return this.controller.signal
  }

  abort(): void {
    this.controller?.abort()
  }
}

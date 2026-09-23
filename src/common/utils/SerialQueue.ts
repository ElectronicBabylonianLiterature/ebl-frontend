export default class SerialQueue {
  private tail: Promise<unknown> = Promise.resolve()

  enqueue<Result>(operation: () => Promise<Result>): Promise<Result> {
    const result = this.tail.then(operation)
    this.tail = result.catch(() => undefined)
    return result
  }
}

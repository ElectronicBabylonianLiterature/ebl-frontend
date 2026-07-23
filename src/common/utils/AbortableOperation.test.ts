import AbortableOperation from './AbortableOperation'

describe('AbortableOperation', () => {
  it('starts with a live signal', () => {
    expect(new AbortableOperation().start().aborted).toBe(false)
  })

  it('aborts the previous signal when a new operation starts', () => {
    const operation = new AbortableOperation()
    const first = operation.start()
    const second = operation.start()

    expect(first.aborted).toBe(true)
    expect(second.aborted).toBe(false)
  })

  it('aborts the current signal', () => {
    const operation = new AbortableOperation()
    const signal = operation.start()

    operation.abort()

    expect(signal.aborted).toBe(true)
  })

  it('does nothing when aborting before any operation started', () => {
    expect(() => new AbortableOperation().abort()).not.toThrow()
  })

  it('can be restarted after being aborted', () => {
    const operation = new AbortableOperation()
    operation.start()
    operation.abort()

    expect(operation.start().aborted).toBe(false)
  })
})

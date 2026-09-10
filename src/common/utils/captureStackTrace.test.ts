import captureStackTrace from 'common/utils/captureStackTrace'

type ErrorWithOptionalCapture = {
  captureStackTrace?: (error: Error, constructorReference: unknown) => void
}

const errorConstructor = Error as unknown as ErrorWithOptionalCapture

let originalCaptureStackTrace: ErrorWithOptionalCapture['captureStackTrace']

beforeEach(() => {
  originalCaptureStackTrace = errorConstructor.captureStackTrace
})

afterEach(() => {
  errorConstructor.captureStackTrace = originalCaptureStackTrace
})

describe('When the engine provides Error.captureStackTrace', () => {
  it('Delegates to it with the error and the constructor reference', () => {
    const capture = jest.fn()
    errorConstructor.captureStackTrace = capture
    const error = new Error('delegated')

    captureStackTrace(error, MyError)

    expect(capture).toHaveBeenCalledWith(error, MyError)
  })
})

describe('When the engine does not provide Error.captureStackTrace', () => {
  beforeEach(() => {
    delete errorConstructor.captureStackTrace
  })

  it('Does not throw', () => {
    expect(() =>
      captureStackTrace(new Error('fallback'), MyError),
    ).not.toThrow()
  })

  it('Assigns a stack carrying the error message', () => {
    const error = new Error('fallback message')

    captureStackTrace(error, MyError)

    expect(error.stack).toEqual(expect.stringContaining('fallback message'))
  })

  it('Lets a subclass constructor complete and keep its own properties', () => {
    const error = new MyError('subclass message')

    expect(error.name).toBe('MyError')
    expect(error.message).toBe('subclass message')
    expect(error.stack).toEqual(expect.stringContaining('subclass message'))
  })
})

class MyError extends Error {
  constructor(message: string) {
    super(message)
    this.name = this.constructor.name
    captureStackTrace(this, this.constructor)
  }
}

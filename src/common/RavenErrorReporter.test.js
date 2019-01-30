import RavenErrorReporter from './RavenErrorReporter.js'

const error = new Error('error')
const ravenErrorReporter = new RavenErrorReporter()

let oldRaven
let raven

global.Raven = {
  captureException: jest.fn(),
  lastEventId: jest.fn(),
  showReportDialog: jest.fn()
}

beforeEach(async () => {
  raven = {
    captureException: jest.fn(),
    lastEventId: jest.fn(),
    showReportDialog: jest.fn()
  }
  raven.lastEventId.mockReturnValueOnce('mockEventId')
  oldRaven = global.Raven
  global.Raven = raven
})

afterEach(() => {
  global.Raven = oldRaven
})

it('Reports error', async () => {
  const info = { componentStack: 'Error happened!' }
  ravenErrorReporter.captureException(error, info)
  expect(raven.captureException).toHaveBeenCalledWith(error, { extra: info })
})

it('Shows report dialog', async () => {
  ravenErrorReporter.showReportDialog()
  expect(raven.showReportDialog).toHaveBeenCalled()
})

/* global Raven */

import RavenErrorReporter from './RavenErrorReporter.js'

describe('Error', () => {
  const error = new Error('error')
  const ravenErrorReporter = new RavenErrorReporter()

  beforeEach(async () => {
    Raven.lastEventId.mockReturnValueOnce('mockEventId')
  })

  it('Reports error', async () => {
    const info = { componentStack: 'Error happened!' }
    ravenErrorReporter.captureException(error, info)
    expect(Raven.captureException).toHaveBeenCalledWith(error, { extra: info })
  })

  it('Shows report dialog', async () => {
    ravenErrorReporter.showReportDialog()
    expect(Raven.showReportDialog).toHaveBeenCalled()
  })
})

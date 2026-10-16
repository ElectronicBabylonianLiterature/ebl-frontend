jest.mock('puppeteer', () => ({ launch: jest.fn() }), { virtual: true })
jest.mock('fs-extra')

const fse = require('fs-extra')
const {
  TEMP_DIR,
  BACKUP_DIR,
  TARGET_DIR,
  updateSitemaps,
} = require('./sitemapUpdater')
const {
  EXISTING_SITEMAPS,
  mockDirectoryContents,
  mockBrowser,
  resolveTimersImmediately,
  setUpSitemapUpdaterTestEnvironment,
} = require('./sitemapUpdaterTestDoubles')

const testEnvironment = setUpSitemapUpdaterTestEnvironment()

beforeEach(() => {
  mockBrowser()
  resolveTimersImmediately()
})

describe('updateSitemaps', () => {
  it('succeeds without flagging a failure when a full download arrives', async () => {
    mockDirectoryContents({
      [TARGET_DIR]: EXISTING_SITEMAPS,
      [BACKUP_DIR]: EXISTING_SITEMAPS,
      [TEMP_DIR]: EXISTING_SITEMAPS,
    })

    await updateSitemaps(testEnvironment.logger)

    expect(process.exitCode).toBeFalsy()
    expect(testEnvironment.logger.error).not.toHaveBeenCalled()
    expect(fse.move).toHaveBeenCalledTimes(EXISTING_SITEMAPS.length)
    expect(fse.remove).toHaveBeenCalledWith(TEMP_DIR)
  })

  it('fails the run and restores the backup when nothing is downloaded', async () => {
    mockDirectoryContents({
      [TARGET_DIR]: EXISTING_SITEMAPS,
      [BACKUP_DIR]: EXISTING_SITEMAPS,
      [TEMP_DIR]: [],
    })

    await updateSitemaps(testEnvironment.logger)

    expect(process.exitCode).toBe(1)
    expect(testEnvironment.logger.error).toHaveBeenCalledWith(
      '❌ Failed to update sitemaps:',
      expect.objectContaining({
        message: expect.stringContaining('Incomplete sitemap download'),
      }),
    )
    expect(fse.copy).toHaveBeenCalledWith(BACKUP_DIR, TARGET_DIR)
    expect(fse.move).not.toHaveBeenCalled()
    expect(fse.remove).toHaveBeenCalledWith(TEMP_DIR)
  })

  it('fails the run and restores the backup when only part of the set arrives', async () => {
    mockDirectoryContents({
      [TARGET_DIR]: EXISTING_SITEMAPS,
      [BACKUP_DIR]: EXISTING_SITEMAPS,
      [TEMP_DIR]: ['sitemap.xml.gz'],
    })

    await updateSitemaps(testEnvironment.logger)

    expect(process.exitCode).toBe(1)
    expect(fse.copy).toHaveBeenCalledWith(BACKUP_DIR, TARGET_DIR)
    expect(fse.move).not.toHaveBeenCalled()
  })

  it('fails the run when the sitemap source is unreachable', async () => {
    mockDirectoryContents({
      [TARGET_DIR]: EXISTING_SITEMAPS,
      [BACKUP_DIR]: EXISTING_SITEMAPS,
    })
    const navigationError = new Error('net::ERR_CONNECTION_REFUSED')
    const { browser, page } = mockBrowser()
    page.goto.mockRejectedValue(navigationError)

    await updateSitemaps(testEnvironment.logger)

    expect(process.exitCode).toBe(1)
    expect(browser.close).toHaveBeenCalledTimes(1)
    expect(testEnvironment.logger.error).toHaveBeenCalledWith(
      '❌ Failed to update sitemaps:',
      navigationError,
    )
    expect(fse.remove).toHaveBeenCalledWith(TEMP_DIR)
  })

  it('reports a failed cleanup without failing an otherwise good run', async () => {
    mockDirectoryContents({
      [TARGET_DIR]: EXISTING_SITEMAPS,
      [BACKUP_DIR]: EXISTING_SITEMAPS,
      [TEMP_DIR]: EXISTING_SITEMAPS,
    })
    const cleanupError = new Error('directory busy')
    fse.remove.mockRejectedValue(cleanupError)

    await updateSitemaps(testEnvironment.logger)

    expect(process.exitCode).toBeFalsy()
    expect(testEnvironment.logger.error).toHaveBeenCalledWith(
      '❌ Failed to remove the temporary download directory:',
      cleanupError,
    )
  })

  it('reports a failed restore without leaving an unhandled rejection', async () => {
    mockDirectoryContents({
      [TARGET_DIR]: EXISTING_SITEMAPS,
      [BACKUP_DIR]: EXISTING_SITEMAPS,
      [TEMP_DIR]: [],
    })
    const restoreError = new Error('disk full')
    fse.copy.mockRejectedValue(restoreError)

    await updateSitemaps(testEnvironment.logger)

    expect(process.exitCode).toBe(1)
    expect(testEnvironment.logger.error).toHaveBeenCalledWith(
      '❌ Failed to restore sitemaps from backup:',
      restoreError,
    )
  })
})

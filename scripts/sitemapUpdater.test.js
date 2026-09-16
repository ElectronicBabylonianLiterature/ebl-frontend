jest.mock('puppeteer', () => ({ launch: jest.fn() }), { virtual: true })
jest.mock('fs-extra')

const path = require('path')
const fse = require('fs-extra')
const {
  TEMP_DIR,
  BACKUP_DIR,
  TARGET_DIR,
  SITEMAP_URL,
  listSitemapFiles,
  backupCurrentSitemaps,
  fetchNewSitemaps,
  assertDownloadIsComplete,
  applySitemapUpdate,
  restoreSitemapsFromBackup,
} = require('./sitemapUpdater')

const {
  EXISTING_SITEMAPS,
  mockDirectoryContents,
  mockBrowser,
  resolveTimersImmediately,
  createLoggerSpy,
} = require('./sitemapUpdaterTestDoubles')

let logger
let originalExitCode

beforeEach(() => {
  logger = createLoggerSpy()
  originalExitCode = process.exitCode
})

afterEach(() => {
  process.exitCode = originalExitCode
})

describe('listSitemapFiles', () => {
  it('returns an empty list when the directory does not exist', () => {
    mockDirectoryContents({})
    expect(listSitemapFiles(BACKUP_DIR)).toEqual([])
  })

  it('keeps only gzipped sitemaps and discards partial downloads', () => {
    mockDirectoryContents({
      [TEMP_DIR]: ['sitemap1.xml.gz', 'sitemap2.xml.gz.crdownload', 'backup'],
    })
    expect(listSitemapFiles(TEMP_DIR)).toEqual(['sitemap1.xml.gz'])
  })
})

describe('assertDownloadIsComplete', () => {
  it('rejects an empty download when no backup exists', () => {
    mockDirectoryContents({})
    expect(() => assertDownloadIsComplete([])).toThrow(
      'downloaded 0 file(s) but expected at least 1',
    )
  })

  it('rejects a download smaller than the existing sitemap set', () => {
    mockDirectoryContents({ [BACKUP_DIR]: EXISTING_SITEMAPS })
    expect(() => assertDownloadIsComplete(['sitemap.xml.gz'])).toThrow(
      'downloaded 1 file(s) but expected at least 3',
    )
  })

  it('accepts a download matching or exceeding the existing sitemap set', () => {
    mockDirectoryContents({ [BACKUP_DIR]: EXISTING_SITEMAPS })
    expect(() => assertDownloadIsComplete(EXISTING_SITEMAPS)).not.toThrow()
    expect(() =>
      assertDownloadIsComplete([...EXISTING_SITEMAPS, 'sitemap3.xml.gz']),
    ).not.toThrow()
  })
})

describe('backupCurrentSitemaps', () => {
  it('copies the current sitemaps into the backup directory', async () => {
    mockDirectoryContents({ [TARGET_DIR]: EXISTING_SITEMAPS })
    await backupCurrentSitemaps()
    expect(fse.emptyDir).toHaveBeenCalledWith(TEMP_DIR)
    expect(fse.copy).toHaveBeenCalledWith(TARGET_DIR, BACKUP_DIR)
  })

  it('skips the copy when there are no sitemaps yet', async () => {
    mockDirectoryContents({})
    await backupCurrentSitemaps()
    expect(fse.copy).not.toHaveBeenCalled()
  })
})

describe('fetchNewSitemaps', () => {
  it('downloads the sitemaps into the temporary directory and closes the browser', async () => {
    const { browser, page, cdpSession } = mockBrowser()
    resolveTimersImmediately()

    await fetchNewSitemaps(logger)

    expect(cdpSession.send).toHaveBeenCalledWith('Page.setDownloadBehavior', {
      behavior: 'allow',
      downloadPath: TEMP_DIR,
    })
    expect(page.goto).toHaveBeenCalledWith(SITEMAP_URL, expect.any(Object))
    expect(browser.close).toHaveBeenCalled()
  })
})

describe('applySitemapUpdate', () => {
  it('replaces the sitemaps with the completed download', async () => {
    mockDirectoryContents({
      [BACKUP_DIR]: EXISTING_SITEMAPS,
      [TEMP_DIR]: EXISTING_SITEMAPS,
    })

    await applySitemapUpdate(logger)

    expect(fse.emptyDir).toHaveBeenCalledWith(TARGET_DIR)
    EXISTING_SITEMAPS.forEach((fileName) => {
      expect(fse.move).toHaveBeenCalledWith(
        path.join(TEMP_DIR, fileName),
        path.join(TARGET_DIR, fileName),
      )
    })
  })

  it('leaves the existing sitemaps untouched when the download is incomplete', async () => {
    mockDirectoryContents({
      [BACKUP_DIR]: EXISTING_SITEMAPS,
      [TEMP_DIR]: ['sitemap.xml.gz'],
    })

    await expect(applySitemapUpdate(logger)).rejects.toThrow(
      'Incomplete sitemap download',
    )
    expect(fse.emptyDir).not.toHaveBeenCalledWith(TARGET_DIR)
    expect(fse.move).not.toHaveBeenCalled()
  })
})

describe('restoreSitemapsFromBackup', () => {
  it('does nothing when no backup was taken', async () => {
    mockDirectoryContents({})
    await restoreSitemapsFromBackup(logger)
    expect(fse.copy).not.toHaveBeenCalled()
  })

  it('puts the backed up sitemaps back in place', async () => {
    mockDirectoryContents({ [BACKUP_DIR]: EXISTING_SITEMAPS })
    await restoreSitemapsFromBackup(logger)
    expect(fse.emptyDir).toHaveBeenCalledWith(TARGET_DIR)
    expect(fse.copy).toHaveBeenCalledWith(BACKUP_DIR, TARGET_DIR)
  })
})

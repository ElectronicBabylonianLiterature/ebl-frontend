const fs = require('fs')
const path = require('path')
const puppeteer = require('puppeteer')
const fse = require('fs-extra')

const TEMP_DIR = path.resolve(__dirname, '../tmp-downloads')
const BACKUP_DIR = path.join(TEMP_DIR, 'backup')
const TARGET_DIR = path.resolve(__dirname, '../public/sitemap')
const SITEMAP_URL = 'https://www.ebl.lmu.de/sitemap/'
const SITEMAP_FILE_EXTENSION = '.gz'
const MINIMUM_SITEMAP_FILE_COUNT = 1
const NAVIGATION_TIMEOUT_IN_MILLISECONDS = 5 * 60 * 1000
const DOWNLOAD_WAIT_IN_MILLISECONDS = 5 * 60 * 1000

function listSitemapFiles(directory) {
  if (!fs.existsSync(directory)) {
    return []
  }
  return fs
    .readdirSync(directory)
    .filter((fileName) => fileName.endsWith(SITEMAP_FILE_EXTENSION))
}

async function backupCurrentSitemaps() {
  await fse.ensureDir(TEMP_DIR)
  await fse.emptyDir(TEMP_DIR)
  if (fs.existsSync(TARGET_DIR)) {
    await fse.copy(TARGET_DIR, BACKUP_DIR)
  }
}

async function fetchNewSitemaps(logger) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox'],
  })
  const page = await browser.newPage()
  const client = await page.target().createCDPSession()
  await client.send('Page.setDownloadBehavior', {
    behavior: 'allow',
    downloadPath: TEMP_DIR,
  })

  logger.log('🌐 Navigating to sitemap page...')
  await page.goto(SITEMAP_URL, {
    waitUntil: 'networkidle2',
    timeout: NAVIGATION_TIMEOUT_IN_MILLISECONDS,
  })

  logger.log('⏳ Waiting up to 5 minutes for automatic downloads...')
  await new Promise((resolve) =>
    setTimeout(resolve, DOWNLOAD_WAIT_IN_MILLISECONDS),
  )

  await browser.close()
}

function assertDownloadIsComplete(downloadedFiles) {
  const expectedFileCount = Math.max(
    listSitemapFiles(BACKUP_DIR).length,
    MINIMUM_SITEMAP_FILE_COUNT,
  )
  if (downloadedFiles.length < expectedFileCount) {
    throw new Error(
      `Incomplete sitemap download: downloaded ${downloadedFiles.length} file(s) but expected at least ${expectedFileCount}.`,
    )
  }
}

async function applySitemapUpdate(logger) {
  const downloadedFiles = listSitemapFiles(TEMP_DIR)
  assertDownloadIsComplete(downloadedFiles)
  await fse.emptyDir(TARGET_DIR)
  await Promise.all(
    downloadedFiles.map((fileName) =>
      fse.move(path.join(TEMP_DIR, fileName), path.join(TARGET_DIR, fileName)),
    ),
  )
  logger.log(`✅ ${downloadedFiles.length} sitemap files updated.`)
}

async function restoreSitemapsFromBackup(logger) {
  if (!fs.existsSync(BACKUP_DIR)) {
    return
  }
  await fse.emptyDir(TARGET_DIR)
  await fse.copy(BACKUP_DIR, TARGET_DIR)
  logger.log('✅ Sitemaps restored from backup.')
}

async function removeTemporaryDirectory(logger) {
  try {
    await fse.remove(TEMP_DIR)
  } catch (error) {
    logger.error('❌ Failed to remove the temporary download directory:', error)
  }
}

async function updateSitemaps(logger) {
  try {
    await backupCurrentSitemaps()
    await fetchNewSitemaps(logger)
    await applySitemapUpdate(logger)
  } catch (error) {
    process.exitCode = 1
    logger.error('❌ Failed to update sitemaps:', error)
    try {
      await restoreSitemapsFromBackup(logger)
    } catch (restoreError) {
      logger.error('❌ Failed to restore sitemaps from backup:', restoreError)
    }
  } finally {
    await removeTemporaryDirectory(logger)
  }
}

module.exports = {
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
  removeTemporaryDirectory,
  updateSitemaps,
}

const fs = require('fs')
const path = require('path')
const puppeteer = require('puppeteer')
const fse = require('fs-extra')

const TEMP_DIR = path.resolve(__dirname, '../tmp-downloads')
const BACKUP_DIR = path.join(TEMP_DIR, 'backup')
const TARGET_DIR = path.resolve(__dirname, '../public/sitemap')
const SITEMAP_URL = 'https://www.ebl.lmu.de/sitemap/'

async function backupCurrentSitemaps() {
  await fse.ensureDir(TEMP_DIR)
  await fse.emptyDir(TEMP_DIR)
  if (fs.existsSync(TARGET_DIR)) {
    await fse.copy(TARGET_DIR, BACKUP_DIR)
  }
}

async function fetchNewSitemaps() {
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

  console.log('🌐 Navigating to sitemap page...')
  await page.goto(SITEMAP_URL, {
    waitUntil: 'networkidle2',
    timeout: 5 * 60 * 1000,
  })

  console.log('⏳ Waiting up to 5 minutes for automatic downloads...')
  await new Promise((resolve) => setTimeout(resolve, 5 * 60 * 1000))

  await browser.close()
}

async function applySitemapUpdate() {
  const files = fs.readdirSync(TEMP_DIR).filter((f) => f.endsWith('.gz'))
  if (files.length === 0) {
    console.warn('⚠️ No sitemap files downloaded. Restoring backup...')
    if (fs.existsSync(BACKUP_DIR)) {
      await fse.emptyDir(TARGET_DIR)
      await fse.copy(BACKUP_DIR, TARGET_DIR)
    }
    console.log('✅ Sitemaps restored from backup.')
  } else {
    await fse.emptyDir(TARGET_DIR)
    await Promise.all(
      files.map((file) =>
        fse.move(path.join(TEMP_DIR, file), path.join(TARGET_DIR, file)),
      ),
    )
    console.log(`✅ ${files.length} sitemap files updated.`)
  }
}

async function updateSitemaps() {
  try {
    await backupCurrentSitemaps()
    await fetchNewSitemaps()
    await applySitemapUpdate()
  } catch (error) {
    console.error('❌ Failed to update sitemaps:', error)
  } finally {
    await fse.remove(TEMP_DIR)
  }
}

updateSitemaps()

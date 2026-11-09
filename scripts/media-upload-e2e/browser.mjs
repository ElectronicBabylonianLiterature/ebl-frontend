import { chromium } from '../../.media-work/browser-tools/node_modules/playwright/index.mjs'
import { mkdir, writeFile } from 'node:fs/promises'
import { createHash, randomUUID } from 'node:crypto'
const browser = await chromium.launch({ channel: 'chrome', headless: true })
const page = await browser.newPage({
  viewport: { width: 1280, height: 900 },
  acceptDownloads: true,
})
const errors = []
page.on('pageerror', (error) => errors.push(error.message))
page.on('console', (message) => {
  if (message.type() === 'error') console.log('browser:', message.text())
})
page.on('response', (response) => {
  if (response.url().includes('/media'))
    console.log(response.request().method(), response.status(), response.url())
})
const assert = (value, message) => {
  if (!value) throw new Error(message)
}
await mkdir('.media-work/evidence', { recursive: true })
await page.goto('http://127.0.0.1:18809')
await page.getByRole('button', { name: 'Add first image' }).click()
const png = Buffer.from(
  await page.evaluate(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 600
    canvas.height = 400
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#bb9566'
    ctx.fillRect(0, 0, 600, 400)
    ctx.fillStyle = '#352921'
    ctx.font = '28px serif'
    ctx.fillText('Local eBL upload test', 120, 190)
    return canvas.toDataURL('image/png').split(',')[1]
  }),
  'base64',
)
await page
  .getByLabel('Choose images or drop them here')
  .setInputFiles({ name: 'tablet.png', mimeType: 'image/png', buffer: png })
const entry = page.getByRole('region', { name: 'Upload tablet.png' })
await entry
  .getByLabel('Caption or short description')
  .fill('Local tablet obverse')
await entry
  .getByLabel('Source institution (where applicable)')
  .fill('Disposable test collection')
await entry
  .getByLabel('Rights / reproduction statement')
  .fill('Authorized local test image for eBL')
await entry.getByRole('checkbox').check()
await page.screenshot({
  path: '.media-work/evidence/upload-desktop.png',
  fullPage: true,
})
await page.setViewportSize({ width: 390, height: 844 })
await page.screenshot({
  path: '.media-work/evidence/upload-mobile.png',
  fullPage: true,
})
await page
  .getByRole('button', { name: 'Submit images for review' })
  .scrollIntoViewIfNeeded()
const uploadResponsePromise = page.waitForResponse(
  (response) =>
    response.request().method() === 'POST' &&
    new URL(response.url()).pathname === '/media',
)
await page.getByRole('button', { name: 'Submit images for review' }).click()
const uploadResponse = await uploadResponsePromise
const uploaded = await uploadResponse.json()
assert(uploadResponse.status() === 201, JSON.stringify(uploaded))
const media = uploaded.media[0]
assert(
  media.publicationStatus === 'PENDING_REVIEW',
  'Upload did not await review',
)
await page.getByText('Submitted for review', { exact: true }).waitFor()
const before = await page.request.get(
  'http://127.0.0.1:18809/media?fragment=K.1',
  { headers: { Authorization: 'Bearer reader' } },
)
assert(
  !(await before.json()).media.some((item) => item.id === media.id),
  'Reader saw pending upload',
)
const unpublished = await page.request.get(
  `http://127.0.0.1:18809${media.representations.original.url}`,
  { headers: { Authorization: 'Bearer reader' } },
)
assert(
  unpublished.status() === 404,
  `Reader pending binary status ${unpublished.status()}`,
)
const denied = await page.request.post(
  'http://127.0.0.1:18809/media?fragment=K.1',
  {
    headers: {
      Authorization: 'Bearer reader',
      'Content-Type': 'image/png',
      'Idempotency-Key': randomUUID(),
      'X-Media-Metadata': encodeURIComponent(
        JSON.stringify({
          originalFilename: 'denied.png',
          type: 'PHOTO',
          caption: 'Denied',
          rightsStatement: 'Test',
          permissionAttested: true,
        }),
      ),
    },
    data: png,
  },
)
assert(denied.status() === 403, `Reader upload status ${denied.status()}`)
await page.getByRole('button', { name: 'Close', exact: true }).last().click()
await page.getByLabel('Local test identity').selectOption('manager')
await page.getByRole('button', { name: 'Publish image', exact: true }).click()
await page.getByText('Published', { exact: true }).waitFor()
await page.getByRole('button', { name: 'Set as primary' }).click()
await page.getByText(/Primary image/).waitFor()
await page.getByLabel('Local test identity').selectOption('reader')
await page.getByAltText('Local tablet obverse', { exact: true }).waitFor()
await page.waitForFunction(() =>
  Array.from(document.images)
    .filter((img) => img.alt === 'Local tablet obverse')
    .every((img) => img.complete && img.naturalWidth > 0),
)
assert(
  (await page.getByRole('button', { name: /Add.*image/ }).count()) === 0,
  'Reader had write UI',
)
const downloadEvent = page.waitForEvent('download')
await page.getByRole('button', { name: 'Download', exact: true }).click()
const download = await downloadEvent
const binary = await page.request.get(
  `http://127.0.0.1:18809${media.representations.original.url}`,
  { headers: { Authorization: 'Bearer reader' } },
)
const bytes = await binary.body()
assert(bytes.equals(png), 'Downloaded original differs from uploaded bytes')
await download.saveAs('.media-work/evidence/' + download.suggestedFilename())
await page.screenshot({
  path: '.media-work/evidence/gallery-mobile.png',
  fullPage: true,
})
await page.setViewportSize({ width: 1280, height: 900 })
await page.screenshot({
  path: '.media-work/evidence/gallery-desktop.png',
  fullPage: true,
})
const report = {
  mediaId: media.id,
  uploadStatus: uploadResponse.status(),
  initialState: media.publicationStatus,
  readerPendingBinary: unpublished.status(),
  readerUploadDenial: denied.status(),
  originalBytes: bytes.length,
  originalSha256: createHash('sha256').update(bytes).digest('hex'),
  download: download.suggestedFilename(),
  browserErrors: errors,
}
assert(errors.length === 0, errors.join('\n'))
await writeFile(
  '.media-work/evidence/e2e-result.json',
  JSON.stringify(report, null, 2),
)
console.log(JSON.stringify(report, null, 2))
await browser.close()

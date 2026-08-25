import {
  defaultImageFileExtension,
  imageDownloadFileName,
  imageFileExtension,
  sanitizeDownloadName,
} from 'common/utils/imageFileExtension'

describe('imageFileExtension', () => {
  test.each([
    ['image/jpeg', 'jpeg'],
    ['image/jpg', 'jpeg'],
    ['image/png', 'png'],
    ['image/webp', 'webp'],
    ['image/gif', 'gif'],
    ['image/tiff', 'tiff'],
    ['image/svg+xml', 'svg'],
    ['IMAGE/PNG', 'png'],
    ['image/jpeg; charset=binary', 'jpeg'],
    [' image/png ', 'png'],
  ])('maps %p to %p', (mimeType, expected) => {
    expect(imageFileExtension(mimeType)).toBe(expected)
  })

  test.each([['application/pdf'], ['nonsense'], [''], [undefined]])(
    'falls back for %p',
    (mimeType) => {
      expect(imageFileExtension(mimeType)).toBe(defaultImageFileExtension)
    },
  )
})

describe('sanitizeDownloadName', () => {
  test.each([
    ['K.1', 'K.1'],
    ['K 1', 'K 1'],
    ['WGL_00000', 'WGL_00000'],
    ['BM 12345 (obv.)', 'BM 12345 (obv.)'],
    ['../../etc/passwd', '.._.._etc_passwd'],
    ['a\\b', 'a_b'],
    ['a\nb', 'a_b'],
    ['///', '___'],
  ])('sanitizes %p to %p', (name, expected) => {
    expect(sanitizeDownloadName(name)).toBe(expected)
  })

  test('falls back when nothing remains', () => {
    expect(sanitizeDownloadName('   ')).toBe('image')
  })
})

test('builds a download file name', () => {
  expect(imageDownloadFileName('K.1', 'image/jpeg')).toBe('eBL-K.1.jpeg')
  expect(imageDownloadFileName('K.1', 'image/svg+xml')).toBe('eBL-K.1.svg')
  expect(imageDownloadFileName('WGL_00000', 'image/png')).toBe(
    'eBL-WGL_00000.png',
  )
})

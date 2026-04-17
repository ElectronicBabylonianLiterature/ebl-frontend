async function loadIiif(): Promise<typeof import('common/iiif')> {
  return import('common/iiif')
}

describe('iiif with IIIF disabled', () => {
  beforeEach(() => {
    jest.resetModules()
    delete process.env.REACT_APP_USE_IIIF_IMAGES
    delete process.env.REACT_APP_IIIF_STATIC_IMAGE_PATH_TEMPLATE
    delete process.env.REACT_APP_IIIF_FRAGMENT_PHOTO_PATH_TEMPLATE
    delete process.env.REACT_APP_IIIF_FOLIO_PATH_TEMPLATE
    delete process.env.REACT_APP_IIIF_FRAGMENT_THUMBNAIL_PATH_TEMPLATE
    delete process.env.REACT_APP_IIIF_CDLI_URL_TEMPLATE
  })

  test('staticImagePath returns legacy path with encoded filename', async () => {
    const { staticImagePath } = await loadIiif()
    expect(staticImagePath('photo 1.jpg')).toBe('/images/photo%201.jpg')
  })

  test('fragmentPhotoPath returns legacy path', async () => {
    const { fragmentPhotoPath } = await loadIiif()
    expect(fragmentPhotoPath('K.1')).toBe('/fragments/K.1/photo')
  })

  test('folioPath returns legacy path', async () => {
    const { folioPath } = await loadIiif()
    expect(folioPath('WGL', '001')).toBe('/folios/WGL/001')
  })

  test('fragmentThumbnailPath returns legacy path', async () => {
    const { fragmentThumbnailPath } = await loadIiif()
    expect(fragmentThumbnailPath('K.1', 'small')).toBe(
      '/fragments/K.1/thumbnail/small',
    )
  })

  test('cdliImageUrl returns legacy url', async () => {
    const { cdliImageUrl } = await loadIiif()
    expect(cdliImageUrl('photos/P000001.jpg')).toBe(
      'https://cdli.earth/photos/P000001.jpg',
    )
  })

  test('staticImagePath returns legacy for non-raster file', async () => {
    const { staticImagePath } = await loadIiif()
    expect(staticImagePath('document.pdf')).toBe('/images/document.pdf')
  })

  test('cdliImageUrl returns legacy for non-raster path', async () => {
    const { cdliImageUrl } = await loadIiif()
    expect(cdliImageUrl('data/file.xml')).toBe(
      'https://cdli.earth/data/file.xml',
    )
  })
})

describe('iiif with IIIF enabled', () => {
  beforeEach(() => {
    jest.resetModules()
    process.env.REACT_APP_USE_IIIF_IMAGES = 'true'
    process.env.REACT_APP_IIIF_STATIC_IMAGE_PATH_TEMPLATE =
      '/iiif/{{encodedFileName}}/full/max/0/default.jpg'
    process.env.REACT_APP_IIIF_FRAGMENT_PHOTO_PATH_TEMPLATE =
      '/iiif/{{encodedNumber}}/full/max/0/default.jpg'
    process.env.REACT_APP_IIIF_FOLIO_PATH_TEMPLATE =
      '/iiif/{{id}}/full/max/0/default.jpg'
    process.env.REACT_APP_IIIF_FRAGMENT_THUMBNAIL_PATH_TEMPLATE =
      '/iiif/{{encodedNumber}}/full/{{width}},/0/default.jpg'
    process.env.REACT_APP_IIIF_CDLI_URL_TEMPLATE =
      'https://iiif.cdli.earth/{{id}}/full/max/0/default.jpg'
  })

  test('staticImagePath returns IIIF path for raster images', async () => {
    const { staticImagePath } = await loadIiif()
    expect(staticImagePath('photo.jpg')).toBe(
      '/iiif/photo.jpg/full/max/0/default.jpg',
    )
  })

  test('staticImagePath encodes special characters', async () => {
    const { staticImagePath } = await loadIiif()
    expect(staticImagePath('photo 1.jpg')).toBe(
      '/iiif/photo%201.jpg/full/max/0/default.jpg',
    )
  })

  test('staticImagePath returns legacy for non-raster', async () => {
    const { staticImagePath } = await loadIiif()
    expect(staticImagePath('document.pdf')).toBe('/images/document.pdf')
  })

  test('fragmentPhotoPath returns IIIF path', async () => {
    const { fragmentPhotoPath } = await loadIiif()
    expect(fragmentPhotoPath('K.1')).toBe('/iiif/K.1/full/max/0/default.jpg')
  })

  test('folioPath returns IIIF path', async () => {
    const { folioPath } = await loadIiif()
    expect(folioPath('WGL', '001')).toBe('/iiif/WGL:001/full/max/0/default.jpg')
  })

  test('fragmentThumbnailPath returns IIIF path with small width', async () => {
    const { fragmentThumbnailPath } = await loadIiif()
    expect(fragmentThumbnailPath('K.1', 'small')).toBe(
      '/iiif/K.1/full/320,/0/default.jpg',
    )
  })

  test('fragmentThumbnailPath returns IIIF path with medium width', async () => {
    const { fragmentThumbnailPath } = await loadIiif()
    expect(fragmentThumbnailPath('K.1', 'medium')).toBe(
      '/iiif/K.1/full/640,/0/default.jpg',
    )
  })

  test('fragmentThumbnailPath returns IIIF path with large width', async () => {
    const { fragmentThumbnailPath } = await loadIiif()
    expect(fragmentThumbnailPath('K.1', 'large')).toBe(
      '/iiif/K.1/full/1200,/0/default.jpg',
    )
  })

  test('cdliImageUrl returns IIIF url for raster images', async () => {
    const { cdliImageUrl } = await loadIiif()
    expect(cdliImageUrl('photos/P000001.jpg')).toBe(
      'https://iiif.cdli.earth/P000001/full/max/0/default.jpg',
    )
  })

  test('cdliImageUrl returns legacy for non-raster', async () => {
    const { cdliImageUrl } = await loadIiif()
    expect(cdliImageUrl('data/file.xml')).toBe(
      'https://cdli.earth/data/file.xml',
    )
  })

  test('cdliImageUrl handles png extension', async () => {
    const { cdliImageUrl } = await loadIiif()
    expect(cdliImageUrl('photos/P000001.png')).toBe(
      'https://iiif.cdli.earth/P000001/full/max/0/default.jpg',
    )
  })

  test('cdliImageUrl handles path without slashes', async () => {
    const { cdliImageUrl } = await loadIiif()
    expect(cdliImageUrl('P000001.jpg')).toBe(
      'https://iiif.cdli.earth/P000001/full/max/0/default.jpg',
    )
  })

  test('rasterImage matches supported extensions', async () => {
    const { staticImagePath } = await loadIiif()
    expect(staticImagePath('test.jpeg')).toContain('/iiif/')
    expect(staticImagePath('test.png')).toContain('/iiif/')
    expect(staticImagePath('test.tiff')).toContain('/iiif/')
    expect(staticImagePath('test.tif')).toContain('/iiif/')
    expect(staticImagePath('test.jp2')).toContain('/iiif/')
    expect(staticImagePath('test.webp')).toContain('/iiif/')
  })
})

describe('iiif with IIIF enabled but no templates', () => {
  beforeEach(() => {
    jest.resetModules()
    process.env.REACT_APP_USE_IIIF_IMAGES = 'true'
    delete process.env.REACT_APP_IIIF_STATIC_IMAGE_PATH_TEMPLATE
    delete process.env.REACT_APP_IIIF_FRAGMENT_PHOTO_PATH_TEMPLATE
  })

  test('staticImagePath falls back to legacy when template missing', async () => {
    const { staticImagePath } = await loadIiif()
    expect(staticImagePath('photo.jpg')).toBe('/images/photo.jpg')
  })

  test('fragmentPhotoPath falls back to legacy when template missing', async () => {
    const { fragmentPhotoPath } = await loadIiif()
    expect(fragmentPhotoPath('K.1')).toBe('/fragments/K.1/photo')
  })
})

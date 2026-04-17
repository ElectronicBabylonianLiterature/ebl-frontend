import { ThumbnailSize } from 'fragmentarium/application/FragmentService'

const iiifEnabled = process.env.REACT_APP_USE_IIIF_IMAGES === 'true'

function applyTemplate(
  template: string,
  values: Record<string, string | number>,
): string {
  return Object.entries(values).reduce(
    (output, [key, value]) =>
      output.replace(new RegExp(`{{${key}}}`, 'g'), String(value)),
    template,
  )
}

function rasterImage(fileName: string): boolean {
  return /\.(jpe?g|png|tiff?|jp2|webp)$/i.test(fileName)
}

function thumbnailWidth(size: ThumbnailSize): number {
  switch (size) {
    case 'small':
      return 320
    case 'medium':
      return 640
    case 'large':
      return 1200
  }
}

export function staticImagePath(fileName: string): string {
  const legacyPath = `/images/${encodeURIComponent(fileName)}`
  const template = process.env.REACT_APP_IIIF_STATIC_IMAGE_PATH_TEMPLATE
  if (!iiifEnabled || !template || !rasterImage(fileName)) {
    return legacyPath
  }

  return applyTemplate(template, {
    fileName,
    encodedFileName: encodeURIComponent(fileName),
    id: encodeURIComponent(fileName),
  })
}

export function fragmentPhotoPath(number: string): string {
  const legacyPath = `/fragments/${encodeURIComponent(number)}/photo`
  const template = process.env.REACT_APP_IIIF_FRAGMENT_PHOTO_PATH_TEMPLATE
  if (!iiifEnabled || !template) {
    return legacyPath
  }

  return applyTemplate(template, {
    number,
    encodedNumber: encodeURIComponent(number),
    id: encodeURIComponent(number),
  })
}

export function folioPath(name: string, number: string): string {
  const legacyPath = `/folios/${encodeURIComponent(name)}/${encodeURIComponent(
    number,
  )}`
  const template = process.env.REACT_APP_IIIF_FOLIO_PATH_TEMPLATE
  if (!iiifEnabled || !template) {
    return legacyPath
  }

  return applyTemplate(template, {
    name,
    number,
    encodedName: encodeURIComponent(name),
    encodedNumber: encodeURIComponent(number),
    id: `${encodeURIComponent(name)}:${encodeURIComponent(number)}`,
  })
}

export function fragmentThumbnailPath(
  number: string,
  size: ThumbnailSize,
): string {
  const legacyPath = `/fragments/${encodeURIComponent(
    number,
  )}/thumbnail/${size}`
  const template = process.env.REACT_APP_IIIF_FRAGMENT_THUMBNAIL_PATH_TEMPLATE
  if (!iiifEnabled || !template) {
    return legacyPath
  }

  return applyTemplate(template, {
    number,
    encodedNumber: encodeURIComponent(number),
    id: encodeURIComponent(number),
    size,
    width: thumbnailWidth(size),
  })
}

export function cdliImageUrl(path: string): string {
  const legacyUrl = `https://cdli.earth/${path}`
  const template = process.env.REACT_APP_IIIF_CDLI_URL_TEMPLATE
  if (!iiifEnabled || !template || !rasterImage(path)) {
    return legacyUrl
  }

  const fileName = path.split('/').pop() ?? path
  const identifier = fileName.replace(/\.[^.]+$/, '')
  return applyTemplate(template, {
    path,
    encodedPath: encodeURI(path),
    fileName,
    encodedFileName: encodeURIComponent(fileName),
    id: encodeURIComponent(identifier),
  })
}

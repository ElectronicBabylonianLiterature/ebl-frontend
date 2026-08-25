export const defaultImageFileExtension = 'jpeg'

export const imageFileExtensions: Readonly<Record<string, string>> = {
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpeg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/tiff': 'tiff',
  'image/svg+xml': 'svg',
}

export function imageFileExtension(mimeType: string | undefined): string {
  const normalized = (mimeType ?? '').trim().toLowerCase().split(';')[0]
  return imageFileExtensions[normalized] ?? defaultImageFileExtension
}

export function sanitizeDownloadName(name: string): string {
  const sanitized = name.replace(/[^\w .()[\]+-]/g, '_').trim()
  return sanitized.length > 0 ? sanitized : 'image'
}

export function imageDownloadFileName(
  name: string,
  mimeType: string | undefined,
): string {
  return `eBL-${sanitizeDownloadName(name)}.${imageFileExtension(mimeType)}`
}

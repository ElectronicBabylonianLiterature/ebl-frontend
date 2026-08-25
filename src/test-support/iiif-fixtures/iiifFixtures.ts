export const iiifOrigin = 'https://iiif.example.com'
export const foreignOrigin = 'https://evil.example.org'
export const presentationContext =
  'http://iiif.io/api/presentation/3/context.json'

export const allowedOrigins: readonly string[] = [iiifOrigin]

export const unsafeScriptUrl = ['javascript', 'alert(1)'].join(':')
export const unsafeDataUrl = 'data:text/html;base64,AAAA'
export const unsafeFileUrl = 'file:///etc/passwd'

export function imageServiceFixture(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    id: `${iiifOrigin}/image/K.1`,
    type: 'ImageService3',
    profile: 'level2',
    width: 4000,
    height: 3000,
    tiles: [{ width: 512, height: 512, scaleFactors: [1, 2, 4, 8] }],
    sizes: [{ width: 500, height: 375 }],
    ...overrides,
  }
}

export function level0ImageServiceFixture(): Record<string, unknown> {
  return imageServiceFixture({ profile: 'level0', tiles: undefined })
}

export function imageBodyFixture(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    id: `${iiifOrigin}/image/K.1/full/max/0/default.jpg`,
    type: 'Image',
    format: 'image/jpeg',
    width: 4000,
    height: 3000,
    service: [imageServiceFixture()],
    ...overrides,
  }
}

export function canvasFixture(
  index = 0,
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  const id = `${iiifOrigin}/canvas/${index}`
  return {
    id,
    type: 'Canvas',
    label: { en: [`Obverse ${index}`] },
    width: 4000,
    height: 3000,
    items: [
      {
        id: `${id}/page`,
        type: 'AnnotationPage',
        items: [
          {
            id: `${id}/annotation`,
            type: 'Annotation',
            motivation: 'painting',
            target: id,
            body: imageBodyFixture(),
          },
        ],
      },
    ],
    ...overrides,
  }
}

export function manifestFixture(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    '@context': presentationContext,
    id: `${iiifOrigin}/presentation/K.1/manifest`,
    type: 'Manifest',
    label: { en: ['K.1'] },
    summary: { en: ['A cuneiform fragment'] },
    metadata: [
      { label: { en: ['Museum'] }, value: { en: ['British Museum'] } },
    ],
    requiredStatement: {
      label: { en: ['Attribution'] },
      value: { en: ['Trustees of the British Museum'] },
    },
    rights: 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
    provider: [
      {
        id: `${iiifOrigin}/provider`,
        type: 'Agent',
        label: { en: ['Electronic Babylonian Library'] },
        homepage: [{ id: 'https://www.ebl.lmu.de/', type: 'Text' }],
      },
    ],
    homepage: [{ id: 'https://www.britishmuseum.org/K.1', type: 'Text' }],
    items: [canvasFixture(0)],
    ...overrides,
  }
}

export function multiCanvasManifestFixture(
  canvasCount = 3,
): Record<string, unknown> {
  return manifestFixture({
    items: Array.from({ length: canvasCount }, (unused, index) =>
      canvasFixture(index),
    ),
  })
}

export function manifestWithoutImageServiceFixture(): Record<string, unknown> {
  return manifestFixture({
    items: [
      canvasFixture(0, {
        items: [
          {
            type: 'AnnotationPage',
            items: [
              {
                type: 'Annotation',
                motivation: 'painting',
                body: imageBodyFixture({ service: undefined }),
              },
            ],
          },
        ],
      }),
    ],
  })
}

export function localizedManifestFixture(): Record<string, unknown> {
  return manifestFixture({
    label: { de: ['Keilschriftfragment'], none: ['K.1'] },
    metadata: [
      {
        label: { 'en-GB': ['Collection'] },
        value: { en: ['Kuyunjik', 'Nineveh'] },
      },
    ],
  })
}

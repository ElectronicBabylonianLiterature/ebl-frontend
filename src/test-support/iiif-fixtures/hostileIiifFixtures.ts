import {
  foreignOrigin,
  iiifOrigin,
  manifestFixture,
  presentationContext,
  unsafeDataUrl,
  unsafeFileUrl,
  unsafeScriptUrl,
} from 'test-support/iiif-fixtures/iiifFixtures'

export const scriptInjection = '<script>alert("xss")</script>'
export const imageInjection = '<img src=x onerror=alert(1)>'

export function hostileManifestFixture(): Record<string, unknown> {
  return {
    '@context': presentationContext,
    id: `${iiifOrigin}/presentation/hostile/manifest`,
    type: 'Manifest',
    label: { en: [scriptInjection] },
    summary: { en: [imageInjection] },
    metadata: [
      { label: { en: [scriptInjection] }, value: { en: [imageInjection] } },
    ],
    requiredStatement: {
      label: { en: ['Attribution'] },
      value: { en: [scriptInjection] },
    },
    rights: unsafeScriptUrl,
    homepage: [{ id: unsafeScriptUrl }],
    provider: [
      {
        id: unsafeDataUrl,
        label: { en: [scriptInjection] },
        homepage: [{ id: unsafeFileUrl }],
      },
    ],
    partOf: [{ id: `${iiifOrigin}/presentation/hostile/manifest` }],
    seeAlso: [{ id: `${foreignOrigin}/tracker.json` }],
    items: [
      {
        id: `${iiifOrigin}/canvas/hostile`,
        type: 'Canvas',
        label: { en: [scriptInjection] },
        width: 100,
        height: 100,
        thumbnail: [{ id: 'data:image/png;base64,AAAA', format: 'image/png' }],
        rendering: [{ id: unsafeScriptUrl, label: { en: ['Bad'] } }],
        items: [
          {
            type: 'AnnotationPage',
            items: [
              {
                type: 'Annotation',
                motivation: 'painting',
                body: {
                  id: `${iiifOrigin}/image/hostile.jpg`,
                  type: 'Image',
                  format: 'image/jpeg',
                  service: [
                    { id: unsafeScriptUrl, type: 'ImageService3' },
                    { id: `${foreignOrigin}/image`, type: 'ImageService3' },
                  ],
                },
              },
            ],
          },
        ],
      },
    ],
  }
}

export function externalOriginManifestFixture(): Record<string, unknown> {
  return manifestFixture({ id: `${foreignOrigin}/presentation/K.1/manifest` })
}

export function cyclicManifestFixture(): Record<string, unknown> {
  const manifest = manifestFixture()
  ;(manifest as { partOf?: unknown }).partOf = [manifest]
  return manifest
}

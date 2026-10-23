import React, { useMemo } from 'react'
import { MediaGalleryContext } from 'fragmentarium/application/MediaGalleryContext'
import ApiMediaRepository from 'fragmentarium/infrastructure/ApiMediaRepository'
import ApiMediaBinaryLoader from 'fragmentarium/infrastructure/ApiMediaBinaryLoader'
import type { JsonApiClient } from 'http/JsonApiClient'

let sessionCounter = 0

export function MediaGalleryProvider({
  apiClient,
  scope,
  children,
}: {
  apiClient: JsonApiClient
  scope: string
  children: React.ReactNode
}): JSX.Element {
  const services = useMemo(
    () =>
      process.env.REACT_APP_MEDIA_GALLERY_ENABLED === 'true'
        ? {
            sessionKey: `${scope}:${++sessionCounter}`,
            repository: new ApiMediaRepository(apiClient),
            binaryLoader: new ApiMediaBinaryLoader(apiClient),
          }
        : null,
    [apiClient, scope],
  )
  return (
    <MediaGalleryContext.Provider value={services}>
      {children}
    </MediaGalleryContext.Provider>
  )
}

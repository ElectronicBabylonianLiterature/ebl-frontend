import React, { useEffect, useMemo } from 'react'
import { MediaGalleryContext } from 'fragmentarium/application/MediaGalleryContext'
import ApiMediaRepository from 'fragmentarium/infrastructure/ApiMediaRepository'
import ApiMediaBinaryLoader from 'fragmentarium/infrastructure/ApiMediaBinaryLoader'
import type { JsonApiClient } from 'http/JsonApiClient'
import type ApiClient from 'http/ApiClient'
import ApiMediaManagementRepository from 'fragmentarium/infrastructure/ApiMediaManagementRepository'
import { useAuthentication } from 'auth/Auth'

type MediaApiClient = JsonApiClient &
  Partial<Pick<ApiClient, 'uploadBinary' | 'requestJson'>>

let sessionCounter = 0

function authenticatedUserId(
  auth: ReturnType<typeof useAuthentication>,
): string | undefined {
  try {
    return auth.isAuthenticated() ? auth.getUser().sub : undefined
  } catch {
    return undefined
  }
}

export function MediaGalleryProvider({
  apiClient,
  scope,
  onMediaChanged,
  children,
}: {
  apiClient: MediaApiClient
  scope: string
  onMediaChanged?: (fragment: string) => void
  children: React.ReactNode
}): JSX.Element {
  const auth = useAuthentication()
  const session = auth.getSession()
  const canManage = session?.isAllowedToManageFragmentMedia?.() === true
  const canUpload =
    canManage || session?.isAllowedToUploadFragmentMedia?.() === true
  const writesEnabled =
    process.env.REACT_APP_MEDIA_UPLOAD_ENABLED === 'true' &&
    canUpload &&
    typeof apiClient.uploadBinary === 'function' &&
    typeof apiClient.requestJson === 'function'
  const currentUserId = authenticatedUserId(auth)
  const services = useMemo(
    () =>
      process.env.REACT_APP_MEDIA_GALLERY_ENABLED === 'true'
        ? {
            sessionKey: `${scope}:${++sessionCounter}`,
            repository: new ApiMediaRepository(apiClient, writesEnabled),
            binaryLoader: new ApiMediaBinaryLoader(apiClient),
            canUpload: writesEnabled && canUpload,
            canManage: writesEnabled && canManage,
            currentUserId,
            ...(writesEnabled
              ? {
                  management: new ApiMediaManagementRepository(
                    apiClient as Pick<
                      ApiClient,
                      'uploadBinary' | 'requestJson'
                    >,
                    onMediaChanged,
                  ),
                }
              : {}),
          }
        : null,
    [
      apiClient,
      scope,
      writesEnabled,
      canUpload,
      canManage,
      currentUserId,
      onMediaChanged,
    ],
  )
  useEffect(() => {
    services?.management?.activate()
    return () => services?.management?.dispose()
  }, [services])
  return (
    <MediaGalleryContext.Provider value={services}>
      {children}
    </MediaGalleryContext.Provider>
  )
}

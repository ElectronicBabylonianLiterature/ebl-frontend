import { useCallback, useEffect, useRef, useState } from 'react'
import { saveAs } from 'file-saver'
import { isCancellation } from 'common/utils/abortError'
import type MediaBinaryLoader from 'fragmentarium/application/MediaBinaryLoader'
import type { MediaResource } from 'fragmentarium/domain/media'

export default function useMediaDownload(
  fragmentNumber: string,
  media: MediaResource,
  binaryLoader: MediaBinaryLoader,
): { download: () => void; downloading: boolean; error: Error | null } {
  const controller = useRef<AbortController | null>(null)
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  useEffect(() => () => controller.current?.abort(), [])

  const download = useCallback((): void => {
    if (controller.current && !controller.current.signal.aborted) {
      return
    }
    const requestController = new AbortController()
    controller.current = requestController
    setDownloading(true)
    setError(null)
    binaryLoader
      .fetch(
        { fragmentNumber, mediaId: media.id, representation: 'original' },
        requestController.signal,
      )
      .then((blob) => {
        if (!requestController.signal.aborted) {
          const extension =
            blob.type === 'image/svg+xml' ? 'svg' : blob.type.split('/')[1]
          const name = fragmentNumber.replace(/[^a-zA-Z0-9._-]/g, '_')
          saveAs(blob, `eBL-${name}-${media.id}.${extension}`)
        }
      })
      .catch((downloadError: Error) => {
        if (!isCancellation(downloadError, requestController.signal)) {
          setError(downloadError)
        }
      })
      .finally(() => {
        if (!requestController.signal.aborted) {
          controller.current = null
          setDownloading(false)
        }
      })
  }, [binaryLoader, fragmentNumber, media.id])
  return { download, downloading, error }
}

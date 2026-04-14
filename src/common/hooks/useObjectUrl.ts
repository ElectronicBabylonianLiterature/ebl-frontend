import { useEffect, useMemo } from 'react'

export default function useObjectUrl(
  data: Blob | null | undefined,
): string | undefined {
  const objectUrl = useMemo(() => {
    if (!data) {
      return undefined
    }

    try {
      return URL.createObjectURL(data)
    } catch {
      return undefined
    }
  }, [data])

  useEffect(() => {
    return (): void => {
      if (objectUrl) {
        try {
          URL.revokeObjectURL(objectUrl)
        } catch {
          return
        }
      }
    }
  }, [objectUrl])

  return objectUrl
}

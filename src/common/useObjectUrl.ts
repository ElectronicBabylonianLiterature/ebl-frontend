import { useEffect, useMemo } from 'react'

export default function useObjectUrl(
  data: Blob | null | undefined,
): string | undefined {
  const objectUrl = useMemo(
    () => (data ? URL.createObjectURL(data) : undefined),
    [data],
  )

  useEffect(() => {
    return (): void => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
      }
    }
  }, [objectUrl])

  return objectUrl
}

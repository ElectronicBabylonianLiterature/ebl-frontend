import { useEffect, useRef, useState } from 'react'

export default function useObjectUrl(
  data: Blob | null | undefined,
): string | undefined {
  const [state, setState] = useState<{ data: Blob; url: string }>()
  const liveUrl = useRef<string>()
  useEffect(() => {
    if (!data) return
    let objectUrl: string
    try {
      objectUrl = URL.createObjectURL(data)
    } catch {
      return
    }
    liveUrl.current = objectUrl
    setState({ data, url: objectUrl })
    return (): void => {
      liveUrl.current = undefined
      if (objectUrl) {
        try {
          URL.revokeObjectURL(objectUrl)
        } catch {
          return
        }
      }
    }
  }, [data])

  return state?.data === data && state?.url === liveUrl.current
    ? state?.url
    : undefined
}

import { useEffect, useState } from 'react'

export default function useObjectUrl(data: Blob): string | undefined {
  const [objectUrl, setObjectUrl] = useState<string>()

  useEffect(() => {
    const url = URL.createObjectURL(data)
    setObjectUrl(url)
    return (): void => URL.revokeObjectURL(url)
  }, [data])

  return objectUrl
}

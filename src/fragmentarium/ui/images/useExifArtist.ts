import { useEffect, useState } from 'react'
import { encode } from 'iconv-lite'
import EXIF from 'exif-js'

export default function useExifArtist(photo?: Blob): string | undefined {
  const [artist, setArtist] = useState<string>()
  useEffect(() => {
    let current = true
    setArtist(undefined)
    if (photo) {
      EXIF.getData(photo as never, function (this: unknown) {
        const value: unknown = EXIF.getTag(this, 'Artist')
        if (current && typeof value === 'string') {
          setArtist(encode(value, 'iso-8859-1').toString())
        }
      })
    }
    return (): void => {
      current = false
    }
  }, [photo])
  return artist
}

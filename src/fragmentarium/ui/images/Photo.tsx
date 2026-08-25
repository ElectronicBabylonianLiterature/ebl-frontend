import React, { useState, useEffect } from 'react'
import { encode } from 'iconv-lite'
import ReactMarkdown from 'react-markdown'
import EXIF from 'exif-js'
import { Fragment } from 'fragmentarium/domain/fragment'
import ImageViewer from 'fragmentarium/ui/images/viewer/ImageViewer'
import 'fragmentarium/ui/images/Photo.css'

function fixEncoding(content: string): string {
  return encode(content, 'iso-8859-1').toString()
}

type Props = {
  photo: Blob
  fragment: Fragment
}

const useExifData = (photo: Blob) => {
  const [artist, setArtist] = useState<string>()

  useEffect(() => {
    EXIF.getData(photo as never, function (this: unknown) {
      const tag = EXIF.getTag(this, 'Artist')
      setArtist(fixEncoding(tag))
    })
  }, [photo])

  return artist
}

export default function Photo({ photo, fragment }: Props): JSX.Element {
  const artist = useExifData(photo)

  return (
    <ImageViewer
      image={photo}
      fileName={fragment.number}
      alt={`Fragment ${fragment.number}`}
      footer={
        <footer className="Photo__copyright">
          <small>
            {artist && (
              <>
                Photograph by {artist}
                <br />
              </>
            )}
            <ReactMarkdown>{fragment.museum.copyright ?? ''}</ReactMarkdown>
          </small>
        </footer>
      }
    />
  )
}

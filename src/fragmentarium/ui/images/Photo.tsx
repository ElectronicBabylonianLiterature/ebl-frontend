import React, { useState, useEffect } from 'react'
import { encode } from 'iconv-lite'

import ReactMarkdown from 'react-markdown'
import EXIF from 'exif-js'
import BlobImage from 'common/BlobImage'
import { Fragment } from 'fragmentarium/domain/fragment'
import './Photo.css'

function fixEncoding(content: string): string {
  return encode(content, 'iso-8859-15').toString()
}

type Props = {
  photo: Blob
  fragment: Fragment
}

export default function Photo({ photo, fragment }: Props): JSX.Element {
  const [artist, setArtist] = useState<string>()

  useEffect(() => {
    // Cast to never is needed due https://github.com/exif-js/exif-js/issues/134
    EXIF.getData(photo as never, function (this: unknown) {
      const tag = EXIF.getTag(this, 'Artist')
      setArtist(fixEncoding(tag))
    })
  }, [photo])

  return (
    <article>
      <BlobImage
        hasLink
        data={photo}
        alt={`A photo of the fragment ${fragment.number}`}
      />
      <footer className="Photo__copyright">
        <small>
          {artist && (
            <>
              Photograph by {artist}
              <br />
            </>
          )}
          <ReactMarkdown source={fragment.museum.copyright} />
        </small>
      </footer>
    </article>
  )
}

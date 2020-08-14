import React, { useState, useEffect } from 'react'

import ReactMarkdown from 'react-markdown'
import EXIF from 'exif-js'
import BlobImage from 'common/BlobImage'
import { Fragment } from 'fragmentarium/domain/fragment'
import './Photo.css'

type Props = {
  photo: Blob
  fragment: Fragment
}

export default function Photo({ photo, fragment }: Props): JSX.Element {
  const [artist, setArtist] = useState()

  useEffect(() => {
    // Cast to never is needed due https://github.com/exif-js/exif-js/issues/134
    EXIF.getData(photo as never, function (this: unknown) {
      setArtist(EXIF.getTag(this, 'Artist'))
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

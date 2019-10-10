import React, { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import EXIF from 'exif-js'
import BlobImage from 'common/BlobImage'
import withData from 'http/withData'

import './Photo.css'

function Photo({ data, fragment }) {
  const [artist, setArtist] = useState()

  useEffect(() => {
    EXIF.getData(data, function() {
      setArtist(EXIF.getTag(this, 'Artist'))
    })
  }, [data])

  return (
    <article>
      <BlobImage
        hasLink
        data={data}
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

export default withData(
  ({ data, fragment }) => <Photo data={data} fragment={fragment} />,
  ({ fragmentService, fragment }) => fragmentService.findPhoto(fragment.number)
)

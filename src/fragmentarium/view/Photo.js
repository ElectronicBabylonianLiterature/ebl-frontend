import React, { useState, useEffect } from 'react'
import BlobImage from 'common/BlobImage'
import withData from 'http/withData'
import EXIF from 'exif-js'

import './Photo.css'

function Photo({ data, number }) {
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
        alt={`A photo of the fragment ${number}`}
      />
      <p className="Photo__copyright">
        {artist && <small>Photograph by {artist}</small>}
      </p>
    </article>
  )
}

export default withData(
  ({ data, number }) => <Photo data={data} number={number} />,
  ({ fragmentService, number }) => fragmentService.findPhoto(number)
)

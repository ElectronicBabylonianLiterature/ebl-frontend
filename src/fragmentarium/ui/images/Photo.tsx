import useExifArtist from 'fragmentarium/ui/images/useExifArtist'
import React from 'react'
import ReactMarkdown from 'react-markdown'
import { Fragment } from 'fragmentarium/domain/fragment'
import RasterImageViewer from 'fragmentarium/ui/images/RasterImageViewer'
import 'fragmentarium/ui/images/Photo.css'

type Props = {
  photo: Blob
  fragment: Fragment
}

export default function Photo({ photo, fragment }: Props): JSX.Element {
  const artist = useExifArtist(photo)
  return (
    <article>
      <RasterImageViewer
        image={photo}
        fileName={fragment.number}
        description={`Fragment ${fragment.number}`}
      />

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
    </article>
  )
}

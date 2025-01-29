import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { encode } from 'iconv-lite'
import ReactMarkdown from 'react-markdown'
import EXIF from 'exif-js'
import { Fragment } from 'fragmentarium/domain/fragment'
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch'
import './Photo.css'
import ImageButtonGroup from './ImageButtonGroup'

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
    // Cast to never is needed due to https://github.com/exif-js/exif-js/issues/134
    EXIF.getData(photo as never, function (this: unknown) {
      const tag = EXIF.getTag(this, 'Artist')
      setArtist(fixEncoding(tag))
    })
  }, [photo])

  return artist
}

export default function Photo({ photo, fragment }: Props): JSX.Element {
  const artist = useExifData(photo)

  const handleDownload = useCallback(() => {
    const link = document.createElement('a')
    link.href = URL.createObjectURL(photo)
    link.download = `eBL-${fragment.number}.jpg`
    link.click()
  }, [photo, fragment.number])

  const handleOpenInNewTab = useCallback(() => {
    const photoUrl = URL.createObjectURL(photo)
    window.open(photoUrl, '_blank')
  }, [photo])

  const imageUrl = useMemo(() => URL.createObjectURL(photo), [photo])

  return (
    <article>
      <TransformWrapper
        panning={{ activationKeys: [] }}
        initialScale={1}
        minScale={0.5}
        maxScale={6}
      >
        {({ zoomIn, zoomOut, resetTransform }) => {
          const imageActions = {
            onZoomIn: () => zoomIn(),
            onZoomOut: () => zoomOut(),
            onReset: () => resetTransform(),
            onDownload: handleDownload,
            onOpenInNewTab: handleOpenInNewTab,
          }

          return (
            <div className="photo-container">
              <ImageButtonGroup imageActions={imageActions} />
              <TransformComponent>
                <div className="image-wrapper">
                  <img
                    src={imageUrl}
                    alt={`Fragment ${fragment.number}`}
                    onClick={(e) => e.preventDefault()}
                  />
                </div>
              </TransformComponent>
            </div>
          )
        }}
      </TransformWrapper>

      <footer className="Photo__copyright">
        <small>
          {artist && (
            <>
              Photograph by {artist}
              <br />
            </>
          )}
          <ReactMarkdown>{fragment.museum.copyright}</ReactMarkdown>
        </small>
      </footer>
    </article>
  )
}

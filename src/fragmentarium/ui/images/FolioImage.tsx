import React, { useCallback, useMemo } from 'react'
import withData from 'http/withData'
import Folio from 'fragmentarium/domain/Folio'
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch'
import ImageButtonGroup from './ImageButtonGroup'
import './Photo.css'

export default withData<{ folio: Folio }, { fragmentService }, Blob>(
  ({ data, folio }) => {
    const handleDownload = useCallback(() => {
      const link = document.createElement('a')
      link.href = URL.createObjectURL(data)
      link.download = `eBL-${folio.fileName}`
      link.click()
    }, [data, folio.fileName])

    const handleOpenInNewTab = useCallback(() => {
      const photoUrl = URL.createObjectURL(data)
      window.open(photoUrl, '_blank')
    }, [data])

    const imageUrl = useMemo(() => URL.createObjectURL(data), [data])

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
                      alt={folio.fileName}
                      onClick={(e) => e.preventDefault()}
                    />
                  </div>
                </TransformComponent>
              </div>
            )
          }}
        </TransformWrapper>
      </article>
    )
  },
  (props) => props.fragmentService.findFolio(props.folio)
)

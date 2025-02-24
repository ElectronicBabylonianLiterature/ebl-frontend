import React from 'react'
import withData from 'http/withData'
import Folio from 'fragmentarium/domain/Folio'
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch'
import ImageButtonGroup, {
  useImageActions,
  getImageActions,
} from './ImageButtonGroup'
import './Photo.css'

export default withData<{ folio: Folio }, { fragmentService }, Blob>(
  ({ data, folio }) => {
    const { handleDownload, handleOpenInNewTab, imageUrl } = useImageActions(
      data,
      folio.fileName
    )

    return (
      <article>
        <TransformWrapper
          panning={{ activationKeys: [] }}
          initialScale={1}
          minScale={0.5}
          maxScale={8}
        >
          {({ zoomIn, zoomOut, resetTransform }) => {
            const imageActions = getImageActions({
              zoomIn,
              zoomOut,
              resetTransform,
              handleDownload,
              handleOpenInNewTab,
            })

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

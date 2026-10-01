import React from 'react'
import withData from 'http/withData'
import { ImageFragmentService } from 'fragmentarium/ui/images/ImageFragmentService'
import Folio from 'fragmentarium/domain/Folio'
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch'
import ImageButtonGroup, {
  useImageActions,
  getImageActions,
} from 'fragmentarium/ui/images/ImageButtonGroup'
import 'fragmentarium/ui/images/Photo.css'

export default withData<
  { folio: Folio },
  { fragmentService: Pick<ImageFragmentService, 'findFolio'> },
  Blob
>(
  ({ data, folio }) => {
    const { handleDownload, handleOpenInNewTab, imageUrl } = useImageActions(
      data,
      folio.fileName,
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
  (props, signal) => props.fragmentService.findFolio(props.folio, signal),
  { retry: true },
)

import React from 'react'
import withData from 'http/withData'
import Folio from 'fragmentarium/domain/Folio'
import ImageViewer from 'fragmentarium/ui/images/viewer/ImageViewer'
import 'fragmentarium/ui/images/Photo.css'

export default withData<{ folio: Folio }, { fragmentService }, Blob>(
  ({ data, folio }) => (
    <ImageViewer image={data} fileName={folio.fileName} alt={folio.fileName} />
  ),
  (props) => props.fragmentService.findFolio(props.folio),
)

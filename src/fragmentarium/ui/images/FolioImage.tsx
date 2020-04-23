import React from 'react'
import BlobImage from 'common/BlobImage'
import withData from 'http/withData'
import { Folio } from 'fragmentarium/domain/fragment'

export default withData<{ folio: Folio }, { fragmentService }, Blob>(
  ({ data, folio }) => <BlobImage hasLink data={data} alt={folio.fileName} />,
  props => props.fragmentService.findFolio(props.folio)
)

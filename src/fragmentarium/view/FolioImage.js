import React from 'react'
import BlobImage from 'common/BlobImage'
import withData from 'http/withData'

export default withData(
  ({ data, folio }) => <BlobImage hasLink data={data} alt={folio.fileName} />,
  props => props.fragmentService.findFolio(props.folio)
)

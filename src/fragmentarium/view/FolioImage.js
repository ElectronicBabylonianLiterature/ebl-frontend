import React from 'react'
import BlobImage from 'common/BlobImage'
import withData from 'http/withData'

function FolioImage (props) {
  return (
    <BlobImage data={props.data} alt={props.folio.fileName} />
  )
}

export default withData(
  FolioImage,
  props => props.fragmentService.findFolio(props.folio)
)

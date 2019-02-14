import React from 'react'
import BlobImage from 'common/BlobImage'
import withData from 'http/withData'
import ExternalLink from 'common/ExternalLink'

function FolioImage (props) {
  let image = URL.createObjectURL(props.data)
  return (
    <ExternalLink href={image}>
      <BlobImage data={props.data} alt={props.folio.fileName} />
    </ExternalLink>
  )
}

export default withData(
  FolioImage,
  props => props.fragmentService.findFolio(props.folio)
)

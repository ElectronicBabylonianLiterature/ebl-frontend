import React from 'react'
import BlobImage from 'common/BlobImage'
import withData from 'http/withData'

function Image (props) {
  return (
    <BlobImage data={props.data} alt={props.fileName} />
  )
}

export default withData(
  Image,
  props => props.fragmentService.findImage(props.fileName)
)

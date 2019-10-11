import React from 'react'
import BlobImage from 'common/BlobImage'
import withData from 'http/withData'

export default withData(
  ({ data, fileName }) => <BlobImage data={data} alt={fileName} />,
  props => props.fragmentService.findImage(props.fileName)
)

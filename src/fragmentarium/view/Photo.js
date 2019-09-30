import React from 'react'
import BlobImage from 'common/BlobImage'
import withData from 'http/withData'

export default withData(
  ({ data, number }) => <BlobImage hasLink data={data} alt={`${number}.jpg`} />,
  ({ fragmentService, number }) => fragmentService.findPhoto(number)
)

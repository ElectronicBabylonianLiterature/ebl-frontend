import React, { Component } from 'react'
import BlobImage from 'common/BlobImage'
import withData from 'http/withData'
import ExternalLink from 'common/ExternalLink'

class FolioImage extends Component {
  constructor (props) {
    super(props)
    this.image = URL.createObjectURL(props.data)
  }

  componentWillUnmount () {
    URL.revokeObjectURL(this.image)
  }

  render () {
    return <ExternalLink href={this.image}>
      <BlobImage data={this.props.data} alt={this.props.folio.fileName} />
    </ExternalLink>
  }
}

export default withData(
  FolioImage,
  props => props.fragmentService.findFolio(props.folio)
)

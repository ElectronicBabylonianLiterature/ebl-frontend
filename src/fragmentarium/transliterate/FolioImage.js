import React, { Component } from 'react'
import { Image } from 'react-bootstrap'
import ExternalLink from 'common/ExternalLink'
import withData from 'http/withData'

class BlobImage extends Component {
  constructor (props) {
    super(props)
    this.image = URL.createObjectURL(props.data)
  }

  componentWillUnmount () {
    URL.revokeObjectURL(this.image)
  }

  render () {
    return <ExternalLink href={this.image}>
      <Image src={this.image} alt={this.props.alt} responsive />
    </ExternalLink>
  }
}

export default withData(
  BlobImage,
  props => props.fragmentService.findFolio(props.folio)
)

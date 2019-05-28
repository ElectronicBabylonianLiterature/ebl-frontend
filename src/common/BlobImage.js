import React, { Component } from 'react'
import { Image } from 'react-bootstrap'
import ExternalLink from 'common/ExternalLink'

class BlobImage extends Component {
  constructor (props) {
    super(props)
    this.image = URL.createObjectURL(props.data)
  }

  componentWillUnmount () {
    URL.revokeObjectURL(this.image)
  }

  render () {
    const hasLink = this.props.hasLink
    const image = <Image src={this.image} alt={this.props.alt} fluid />
    return hasLink ? (
      <ExternalLink href={this.image}> {image} </ExternalLink>
    ) : (
      image
    )
  }
}

export default BlobImage

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

  imageToDisplay = () => {
    return <Image src={this.image} alt={this.props.alt} fluid />
  }

  render () {
    const hasLink = this.props.hasLink
    return (
      hasLink
        ? <ExternalLink href={this.image}> <this.imageToDisplay /> </ExternalLink>
        : <this.imageToDisplay />
    )
  }
}

export default BlobImage

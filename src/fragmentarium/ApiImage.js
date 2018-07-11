import React, { Component } from 'react'

class ApiImage extends Component {
  state = {
    image: ''
  }

  get imageUrl () {
    return `/images/${this.props.fileName}`
  }

  componentDidMount () {
    this.props.apiClient.fetchBlob(this.imageUrl)
      .then(blob => {
        this.setState({image: URL.createObjectURL(blob)})
      })
      .catch(() => this.setState({image: ''}))
  }

  componentWillUnmount () {
    if (this.state.image) {
      URL.revokeObjectURL(this.state.image)
    }
  }

  render () {
    return <img width='100%' src={this.state.image} alt={this.props.fileName} />
  }
}

export default ApiImage

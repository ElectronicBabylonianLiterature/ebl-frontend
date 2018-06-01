import React, { Component } from 'react'
import ReactMarkdown from 'react-markdown'

class Word extends Component {
  render () {
    return (
      <ReactMarkdown source={this.props.value.source} />
    )
  }
}

export default Word

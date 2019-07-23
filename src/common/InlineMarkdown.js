import React, { Component } from 'react'
import ReactMarkdown from 'react-markdown'

export default class InlineMarkdown extends Component {
  render() {
    return (
      <ReactMarkdown
        source={this.props.source}
        disallowedTypes={['paragraph']}
        unwrapDisallowed
      />
    )
  }
}

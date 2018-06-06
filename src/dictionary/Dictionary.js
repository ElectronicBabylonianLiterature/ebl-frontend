import React, { Component } from 'react'

import WordSearch from './WordSearch'
import Word from './Word'

class Dictionary extends Component {
  constructor (props) {
    super(props)

    this.state = {
      word: {source: ''}
    }
  }

  onSearch = response => {
    this.setState({word: response})
  }

  render () {
    return (
      <div>
        <WordSearch onResponse={this.onSearch} auth={this.props.auth} />
        <Word value={this.state.word} />
      </div>
    )
  }
}

export default Dictionary

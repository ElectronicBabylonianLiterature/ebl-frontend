import React, { Component, Fragment } from 'react'
import { Alert } from 'element-react'

import WordSearch from './WordSearch'
import Word from './Word'

class Dictionary extends Component {
  constructor (props) {
    super(props)

    this.state = {
      word: null,
      error: null
    }
  }

  onSearch = (response, error) => {
    this.setState({word: response, error: error})
  }

  render () {
    return (
      <Fragment>
        {this.props.auth.isAuthenticated()
          ? (
            <Fragment>
              <WordSearch onResponse={this.onSearch} auth={this.props.auth} />
              {this.state.word && <Word value={this.state.word} />}
              {this.state.error && <Alert type='error' title={this.state.error.message} showIcon closable={false} />}
            </Fragment>
          )
          : <div>You need to be logged in to access the dictionary.</div>
        }
      </Fragment>
    )
  }
}

export default Dictionary

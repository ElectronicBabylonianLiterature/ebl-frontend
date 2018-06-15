import React, { Component, Fragment } from 'react'
import { Alert } from 'element-react'

import WordSearch from './WordSearch'
import Word from './Word'

import './Dictionary.css'

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
      <section>
        <h2>Dictionary</h2>
        {this.props.auth.isAuthenticated()
          ? (
            <Fragment>
              <header className='Dictionary-search'>
                <WordSearch onResponse={this.onSearch} auth={this.props.auth} />
              </header>
              {this.state.word && <Word value={this.state.word} />}
              {this.state.error && <Alert type='error' title={this.state.error.message} showIcon closable={false} />}
            </Fragment>
          )
          : <p>You need to be logged in to access the dictionary.</p>
        }
      </section>
    )
  }
}

export default Dictionary

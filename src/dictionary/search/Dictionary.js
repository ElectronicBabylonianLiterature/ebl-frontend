import React, { Component, Fragment } from 'react'
import { Alert } from 'react-bootstrap'

import WordSearch from './WordSearch'
import Word from './Word'

import './Dictionary.css'

class Dictionary extends Component {
  constructor (props) {
    super(props)

    this.state = {
      words: [],
      error: null
    }
  }

  onSearch = (response, error) => {
    this.setState({words: response || [], error: error})
  }

  render () {
    return (
      <section>
        <h2>Dictionary</h2>
        {this.props.auth.isAuthenticated()
          ? (
            <Fragment>
              <header className='Dictionary-search'>
                <WordSearch onResponse={this.onSearch} httpClient={this.props.httpClient} />
              </header>
              <ul className='Dictionary-results'>
                {this.state.words.map(word =>
                  <li key={word._id}>
                    <Word value={word} />
                  </li>
                )}
              </ul>
              {this.state.error && (
                <Alert bsStyle='danger'>
                  {this.state.error.message}
                </Alert>
              )}
            </Fragment>
          )
          : <p>You need to be logged in to access the dictionary.</p>
        }
      </section>
    )
  }
}

export default Dictionary

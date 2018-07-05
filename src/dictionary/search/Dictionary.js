import React, { Component, Fragment } from 'react'
import queryString from 'query-string'

import WordSearchForm from './WordSearchForm'
import WordSearch from './WordSearch'

import './Dictionary.css'

class Dictionary extends Component {
  render () {
    const query = queryString.parse(this.props.location.search).query

    return (
      <section>
        <h2>Dictionary</h2>
        {this.props.auth.isAuthenticated()
          ? (
            <Fragment>
              <header className='Dictionary-search'>
                <WordSearchForm query={query} />
              </header>
              <WordSearch query={query} apiClient={this.props.apiClient} />
            </Fragment>
          )
          : <p>You need to be logged in to access the dictionary.</p>
        }
      </section>
    )
  }
}

export default Dictionary

import React, { Component, Fragment } from 'react'
import queryString from 'query-string'

import WordSearchForm from './WordSearchForm'
import WordSearch from './WordSearch'

import './Dictionary.css'

class Dictionary extends Component {
  render () {
    const lemma = queryString.parse(this.props.location.search).lemma

    return (
      <section>
        <h2>Dictionary</h2>
        {this.props.auth.isAuthenticated()
          ? (
            <Fragment>
              <header className='Dictionary-search'>
                <WordSearchForm lemma={lemma} />
              </header>
              <WordSearch lemma={lemma} httpClient={this.props.httpClient} />
            </Fragment>
          )
          : <p>You need to be logged in to access the dictionary.</p>
        }
      </section>
    )
  }
}

export default Dictionary

import React, { Component, Fragment } from 'react'
import queryString from 'query-string'

import Breadcrumbs from 'Breadcrumbs'
import WordSearchForm from './WordSearchForm'
import WordSearch from './WordSearch'

import './Dictionary.css'

class Dictionary extends Component {
  render () {
    const query = queryString.parse(this.props.location.search).query

    return (
      <section className='App-content'>
        <header>
          <Breadcrumbs section='Dictionary' />
          <h2>Dictionary</h2>
        </header>
        {this.props.wordService.allowedToRead()
          ? (
            <Fragment>
              <header className='Dictionary-search'>
                <WordSearchForm query={query} />
              </header>
              <WordSearch query={query} wordService={this.props.wordService} />
            </Fragment>
          )
          : <p>You do not have the rights to access the dictionary.</p>
        }
      </section>
    )
  }
}

export default Dictionary

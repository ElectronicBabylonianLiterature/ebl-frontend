import React, { Component, Fragment } from 'react'
import { Breadcrumb } from 'react-bootstrap'
import { LinkContainer } from 'react-router-bootstrap'
import queryString from 'query-string'

import WordSearchForm from './WordSearchForm'
import WordSearch from './WordSearch'

import './Dictionary.css'

class Dictionary extends Component {
  render () {
    const query = queryString.parse(this.props.location.search).query

    return (
      <section>
        <header>
          <Breadcrumb separator='/'>
            <LinkContainer to='/'>
              <Breadcrumb.Item>eBL</Breadcrumb.Item>
            </LinkContainer>
            <Breadcrumb.Item active>Dictionary</Breadcrumb.Item>
          </Breadcrumb>
          <h2>Dictionary</h2>
        </header>
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

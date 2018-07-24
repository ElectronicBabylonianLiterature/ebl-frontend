import React, { Component } from 'react'
import queryString from 'query-string'
import Breadcrumbs from 'Breadcrumbs'
import FragmentSearchForm from 'fragmentarium/search/FragmentSearchForm'
import FragmentSearch from 'fragmentarium/search/FragmentSearch'
import LuckyButton from 'fragmentarium/LuckyButton'
import Statistics from 'fragmentarium/Statistics'

import './Fragmentarium.css'

class Fragmentarium extends Component {
  header = () => {
    return (
      <header>
        <Breadcrumbs section='Fragmentarium' />
        <h2>Fragmentarium</h2>
      </header>
    )
  }

  render () {
    const number = queryString.parse(this.props.location.search).number
    return (
      <section className='App-content'>
        <this.header />
        {this.props.auth.isAuthenticated()
          ? (
            <section className='Fragmentarium-search'>
              <header className='Fragmentarium-search__header'>
                <FragmentSearchForm number={number} />
                <div className='Fragmentarium-lucky-button'>
                  <LuckyButton apiClient={this.props.apiClient} />
                </div>
              </header>
              <FragmentSearch number={number} apiClient={this.props.apiClient} />
            </section>
          )
          : <p>You need to be logged in to access the fragments.</p>
        }
        <Statistics apiClient={this.props.apiClient} />
      </section>
    )
  }
}

export default Fragmentarium

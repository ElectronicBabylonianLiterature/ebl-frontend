import React, { Component } from 'react'
import queryString from 'query-string'
import Breadcrumbs from 'Breadcrumbs'
import FragmentSearch from 'fragmentarium/search/FragmentSearch'
import Statistics from 'fragmentarium/Statistics'

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
    const number = queryString.parse(this.props.location.search).number || 'K.1'
    return (
      <section className='App-content'>
        <this.header />
        <section>
          {this.props.auth.isAuthenticated()
            ? <FragmentSearch number={number} apiClient={this.props.apiClient} />
            : <p>You need to be logged in to access the fragments.</p>
          }
        </section>
        <Statistics apiClient={this.props.apiClient} />
      </section>
    )
  }
}

export default Fragmentarium

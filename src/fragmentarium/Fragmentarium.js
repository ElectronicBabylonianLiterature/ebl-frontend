import React, { Component } from 'react'
import queryString from 'query-string'
import Breadcrumbs from 'Breadcrumbs'
import NumberSearchForm from 'fragmentarium/search/NumberSearchForm'
import NumberSearch from 'fragmentarium/search/NumberSearch'
import TransliterationSearchForm from 'fragmentarium/search/TransliterationSearchForm'
import TransliterationSearch from 'fragmentarium/search/TransliterationSearch'
import RandomButton from 'fragmentarium/RandomButton'
import PioneersButton from 'fragmentarium/PioneersButton'
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
    const transliteration = queryString.parse(this.props.location.search).transliteration
    return (
      <section className='App-content'>
        <this.header />
        {this.props.auth.isAllowedTo('read:fragments')
          ? (
            <section className='Fragmentarium-search'>
              <header className='Fragmentarium-search__header'>
                <NumberSearchForm number={number} />
                <TransliterationSearchForm transliteration={transliteration} />
                <div className='Fragmentarium-search__button-bar'>
                  <RandomButton apiClient={this.props.apiClient} param='random'>
                    I'm feeling lucky
                  </RandomButton>
                  {' '}
                  <PioneersButton auth={this.props.auth} apiClient={this.props.apiClient} />
                </div>
              </header>
              <NumberSearch number={number} apiClient={this.props.apiClient} />
              <TransliterationSearch transliteration={transliteration} apiClient={this.props.apiClient} />
            </section>
          )
          : <p>You do not have the rights to access the fragmentarium.</p>
        }
        <Statistics apiClient={this.props.apiClient} />
      </section>
    )
  }
}

export default Fragmentarium
